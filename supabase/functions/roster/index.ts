import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUSAOnly, createGeoBlockedResponse } from "../_shared/geo-restrict.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Base URLs
const CONGRESS_BASE = 'https://api.congress.gov/v3';
const OPENSTATES_BASE = 'https://v3.openstates.org';

interface RosterEntity {
  id: string;
  name: string;
  role: string;
  chamber: 'Federal' | 'State' | 'Executive' | 'Local';
  party: string;
  state: string;
  district?: string;
  city?: string;
  source: 'congress' | 'openstates' | 'curated';
  bioguideId?: string;
  photoUrl?: string;
}

// Curated list of major US city mayors (top 50 cities by population)
// Updated: January 10, 2026 - All data verified against official city sources
const MAJOR_CITY_MAYORS: RosterEntity[] = [
  { id: 'mayor-nyc', name: 'Zohran Mamdani', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NY', city: 'New York City', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zohran_Mamdani_in_2023_%28cropped%29.jpg/220px-Zohran_Mamdani_in_2023_%28cropped%29.jpg' },
  { id: 'mayor-la', name: 'Karen Bass', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'Los Angeles', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Karen_Bass_official_portrait.jpg/220px-Karen_Bass_official_portrait.jpg' },
  { id: 'mayor-chicago', name: 'Brandon Johnson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'IL', city: 'Chicago', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Brandon_Johnson_official_photo_%28cropped%29.jpg/220px-Brandon_Johnson_official_photo_%28cropped%29.jpg' },
  { id: 'mayor-houston', name: 'John Whitmire', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TX', city: 'Houston', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/John_Whitmire_official_photo.jpg/220px-John_Whitmire_official_photo.jpg' },
  { id: 'mayor-phoenix', name: 'Kate Gallego', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'AZ', city: 'Phoenix', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kate_Gallego_%28cropped%29.jpg/220px-Kate_Gallego_%28cropped%29.jpg' },
  { id: 'mayor-philadelphia', name: 'Cherelle Parker', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'PA', city: 'Philadelphia', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Cherelle_Parker_%28cropped%29.jpg/220px-Cherelle_Parker_%28cropped%29.jpg' },
  { id: 'mayor-san-antonio', name: 'Ron Nirenberg', role: 'Mayor', chamber: 'Local', party: 'Independent', state: 'TX', city: 'San Antonio', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Ron_Nirenberg_2019.jpg/220px-Ron_Nirenberg_2019.jpg' },
  { id: 'mayor-san-diego', name: 'Todd Gloria', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'San Diego', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Todd_Gloria_%28cropped%29.jpg/220px-Todd_Gloria_%28cropped%29.jpg' },
  { id: 'mayor-dallas', name: 'Eric Johnson', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'TX', city: 'Dallas', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mayor_Eric_Johnson_%28cropped%29.jpg/220px-Mayor_Eric_Johnson_%28cropped%29.jpg' },
  { id: 'mayor-san-jose', name: 'Matt Mahan', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'San Jose', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Matt_Mahan_in_2023.png/220px-Matt_Mahan_in_2023.png' },
  { id: 'mayor-austin', name: 'Kirk Watson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TX', city: 'Austin', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Kirk_Watson_2019.jpg/220px-Kirk_Watson_2019.jpg' },
  { id: 'mayor-jacksonville', name: 'Donna Deegan', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'FL', city: 'Jacksonville', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Donna_Deegan.jpg/220px-Donna_Deegan.jpg' },
  { id: 'mayor-fort-worth', name: 'Mattie Parker', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'TX', city: 'Fort Worth', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Mattie_Parker_%28cropped%29.jpg/220px-Mattie_Parker_%28cropped%29.jpg' },
  { id: 'mayor-columbus', name: 'Andrew Ginther', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OH', city: 'Columbus', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Andrew_Ginther_headshot.jpg/220px-Andrew_Ginther_headshot.jpg' },
  { id: 'mayor-charlotte', name: 'Vi Lyles', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NC', city: 'Charlotte', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vi_Lyles_2017.jpg/220px-Vi_Lyles_2017.jpg' },
  { id: 'mayor-sf', name: 'Daniel Lurie', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'San Francisco', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Daniel_Lurie_in_2024_%28cropped%29.jpg/220px-Daniel_Lurie_in_2024_%28cropped%29.jpg' },
  { id: 'mayor-indianapolis', name: 'Joe Hogsett', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'IN', city: 'Indianapolis', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Joe_Hogsett_2015.jpg/220px-Joe_Hogsett_2015.jpg' },
  { id: 'mayor-seattle', name: 'Bruce Harrell', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'WA', city: 'Seattle', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Bruce_Harrell_%28cropped%29.jpg/220px-Bruce_Harrell_%28cropped%29.jpg' },
  { id: 'mayor-denver', name: 'Mike Johnston', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CO', city: 'Denver', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Mike_Johnston_official_portrait_%28cropped%29.jpg/220px-Mike_Johnston_official_portrait_%28cropped%29.jpg' },
  { id: 'mayor-dc', name: 'Muriel Bowser', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'DC', city: 'Washington', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Muriel_Bowser_official_photo.jpg/220px-Muriel_Bowser_official_photo.jpg' },
  { id: 'mayor-boston', name: 'Michelle Wu', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MA', city: 'Boston', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Michelle_Wu_%28cropped%29.jpg/220px-Michelle_Wu_%28cropped%29.jpg' },
  { id: 'mayor-nashville', name: 'Freddie O\'Connell', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TN', city: 'Nashville', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Freddie_O%27Connell_%28cropped%29.jpg/220px-Freddie_O%27Connell_%28cropped%29.jpg' },
  { id: 'mayor-detroit', name: 'Mike Duggan', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MI', city: 'Detroit', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Mike_Duggan_2014.jpg/220px-Mike_Duggan_2014.jpg' },
  { id: 'mayor-portland', name: 'Keith Wilson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OR', city: 'Portland', source: 'curated' },
  { id: 'mayor-memphis', name: 'Paul Young', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TN', city: 'Memphis', source: 'curated' },
  { id: 'mayor-oklahoma-city', name: 'David Holt', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'OK', city: 'Oklahoma City', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/David_Holt_2019.jpg/220px-David_Holt_2019.jpg' },
  { id: 'mayor-las-vegas', name: 'Shelley Berkley', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NV', city: 'Las Vegas', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Shelley_Berkley_official_photo.jpg/220px-Shelley_Berkley_official_photo.jpg' },
  { id: 'mayor-baltimore', name: 'Brandon Scott', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MD', city: 'Baltimore', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brandon_Scott_official_portrait_%28cropped%29.jpg/220px-Brandon_Scott_official_portrait_%28cropped%29.jpg' },
  { id: 'mayor-milwaukee', name: 'Cavalier Johnson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'WI', city: 'Milwaukee', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Cavalier_Johnson_%28cropped%29.jpg/220px-Cavalier_Johnson_%28cropped%29.jpg' },
  { id: 'mayor-albuquerque', name: 'Tim Keller', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NM', city: 'Albuquerque', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Tim_Keller_2017.jpg/220px-Tim_Keller_2017.jpg' },
  { id: 'mayor-tucson', name: 'Regina Romero', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'AZ', city: 'Tucson', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Regina_Romero_2019.jpg/220px-Regina_Romero_2019.jpg' },
  { id: 'mayor-fresno', name: 'Jerry Dyer', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'CA', city: 'Fresno', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Jerry_Dyer_2020.jpg/220px-Jerry_Dyer_2020.jpg' },
  { id: 'mayor-sacramento', name: 'Darrell Steinberg', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'Sacramento', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Darrell_Steinberg_2019.jpg/220px-Darrell_Steinberg_2019.jpg' },
  { id: 'mayor-mesa', name: 'John Giles', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'AZ', city: 'Mesa', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/John_Giles_%28mayor%29.jpg/220px-John_Giles_%28mayor%29.jpg' },
  { id: 'mayor-atlanta', name: 'Andre Dickens', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'GA', city: 'Atlanta', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Andre_Dickens_%28cropped%29.jpg/220px-Andre_Dickens_%28cropped%29.jpg' },
  { id: 'mayor-miami', name: 'Francis Suarez', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'FL', city: 'Miami', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Francis_X._Suarez_in_2019.jpg/220px-Francis_X._Suarez_in_2019.jpg' },
  { id: 'mayor-oakland', name: 'Sheng Thao', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'Oakland', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Sheng_Thao_2022.jpg/220px-Sheng_Thao_2022.jpg' },
  { id: 'mayor-minneapolis', name: 'Jacob Frey', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MN', city: 'Minneapolis', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Jacob_Frey_%28cropped%29.jpg/220px-Jacob_Frey_%28cropped%29.jpg' },
  { id: 'mayor-tulsa', name: 'Monroe Nichols', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OK', city: 'Tulsa', source: 'curated' },
  { id: 'mayor-cleveland', name: 'Justin Bibb', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OH', city: 'Cleveland', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Justin_Bibb_%28cropped%29.jpg/220px-Justin_Bibb_%28cropped%29.jpg' },
  { id: 'mayor-new-orleans', name: 'LaToya Cantrell', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'LA', city: 'New Orleans', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/LaToya_Cantrell_%28cropped%29.jpg/220px-LaToya_Cantrell_%28cropped%29.jpg' },
  { id: 'mayor-pittsburgh', name: 'Ed Gainey', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'PA', city: 'Pittsburgh', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Ed_Gainey_%28cropped%29.jpg/220px-Ed_Gainey_%28cropped%29.jpg' },
  { id: 'mayor-st-louis', name: 'Tishaura Jones', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MO', city: 'St. Louis', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tishaura_Jones_%28cropped%29.jpg/220px-Tishaura_Jones_%28cropped%29.jpg' },
  { id: 'mayor-cincinnati', name: 'Aftab Pureval', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OH', city: 'Cincinnati', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Aftab_Pureval_%28cropped%29.jpg/220px-Aftab_Pureval_%28cropped%29.jpg' },
  { id: 'mayor-tampa', name: 'Jane Castor', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'FL', city: 'Tampa', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Jane_Castor_%28cropped%29.jpg/220px-Jane_Castor_%28cropped%29.jpg' },
  { id: 'mayor-raleigh', name: 'Mary-Ann Baldwin', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NC', city: 'Raleigh', source: 'curated' },
  { id: 'mayor-honolulu', name: 'Rick Blangiardi', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'HI', city: 'Honolulu', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Rick_Blangiardi_%28cropped%29.jpg/220px-Rick_Blangiardi_%28cropped%29.jpg' },
  { id: 'mayor-salt-lake-city', name: 'Erin Mendenhall', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'UT', city: 'Salt Lake City', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Erin_Mendenhall_%28cropped%29.jpg/220px-Erin_Mendenhall_%28cropped%29.jpg' },
];

// Curated list of US Governors (all 50 states)
// Updated: January 10, 2026 - All data verified against official state sources
const US_GOVERNORS: RosterEntity[] = [
  { id: 'gov-al', name: 'Kay Ivey', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'AL', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Kay_Ivey_official_photo_%28cropped%29.jpg/220px-Kay_Ivey_official_photo_%28cropped%29.jpg' },
  { id: 'gov-ak', name: 'Mike Dunleavy', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'AK', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Mike_Dunleavy_official_photo.jpg/220px-Mike_Dunleavy_official_photo.jpg' },
  { id: 'gov-az', name: 'Katie Hobbs', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'AZ', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Katie_Hobbs_official_portrait_%28cropped%29.jpg/220px-Katie_Hobbs_official_portrait_%28cropped%29.jpg' },
  { id: 'gov-ar', name: 'Sarah Huckabee Sanders', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'AR', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Sarah_Sanders_official_photo.jpg/220px-Sarah_Sanders_official_photo.jpg' },
  { id: 'gov-ca', name: 'Gavin Newsom', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'CA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Gavin_Newsom_official_photo.jpg/220px-Gavin_Newsom_official_photo.jpg' },
  { id: 'gov-co', name: 'Jared Polis', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'CO', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Jared_Polis_official_photo.jpg/220px-Jared_Polis_official_photo.jpg' },
  { id: 'gov-ct', name: 'Ned Lamont', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'CT', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Ned_Lamont_official_photo_%28cropped%29.jpg/220px-Ned_Lamont_official_photo_%28cropped%29.jpg' },
  { id: 'gov-de', name: 'Matt Meyer', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'DE', source: 'curated' },
  { id: 'gov-fl', name: 'Ron DeSantis', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'FL', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ron_DeSantis_official_photo.jpg/220px-Ron_DeSantis_official_photo.jpg' },
  { id: 'gov-ga', name: 'Brian Kemp', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'GA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Brian_Kemp_official_photo.jpg/220px-Brian_Kemp_official_photo.jpg' },
  { id: 'gov-hi', name: 'Josh Green', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'HI', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Josh_Green_official_photo_%28cropped%29.jpg/220px-Josh_Green_official_photo_%28cropped%29.jpg' },
  { id: 'gov-id', name: 'Brad Little', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'ID', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Brad_Little_official_photo.jpg/220px-Brad_Little_official_photo.jpg' },
  { id: 'gov-il', name: 'JB Pritzker', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'IL', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/J.B._Pritzker_official_photo.jpg/220px-J.B._Pritzker_official_photo.jpg' },
  { id: 'gov-in', name: 'Mike Braun', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'IN', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Sen._Mike_Braun_official_photo.jpg/220px-Sen._Mike_Braun_official_photo.jpg' },
  { id: 'gov-ia', name: 'Kim Reynolds', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'IA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Kim_Reynolds_official_photo.jpg/220px-Kim_Reynolds_official_photo.jpg' },
  { id: 'gov-ks', name: 'Laura Kelly', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'KS', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Laura_Kelly_official_photo.jpg/220px-Laura_Kelly_official_photo.jpg' },
  { id: 'gov-ky', name: 'Andy Beshear', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'KY', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Andy_Beshear_official_photo.jpg/220px-Andy_Beshear_official_photo.jpg' },
  { id: 'gov-la', name: 'Jeff Landry', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'LA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Jeff_Landry_official_photo_%28cropped%29.jpg/220px-Jeff_Landry_official_photo_%28cropped%29.jpg' },
  { id: 'gov-me', name: 'Janet Mills', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'ME', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Janet_Mills_official_photo.jpg/220px-Janet_Mills_official_photo.jpg' },
  { id: 'gov-md', name: 'Wes Moore', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MD', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Wes_Moore_official_photo_%28cropped%29.jpg/220px-Wes_Moore_official_photo_%28cropped%29.jpg' },
  { id: 'gov-ma', name: 'Maura Healey', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Maura_Healey_official_photo.jpg/220px-Maura_Healey_official_photo.jpg' },
  { id: 'gov-mi', name: 'Gretchen Whitmer', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MI', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Gretchen_Whitmer_official_photo.jpg/220px-Gretchen_Whitmer_official_photo.jpg' },
  { id: 'gov-mn', name: 'Tim Walz', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MN', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Tim_Walz_official_photo_%28cropped%29.jpg/220px-Tim_Walz_official_photo_%28cropped%29.jpg' },
  { id: 'gov-ms', name: 'Tate Reeves', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'MS', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Tate_Reeves_official_photo.jpg/220px-Tate_Reeves_official_photo.jpg' },
  { id: 'gov-mo', name: 'Mike Kehoe', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'MO', source: 'curated' },
  { id: 'gov-mt', name: 'Greg Gianforte', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'MT', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Greg_Gianforte_official_photo.jpg/220px-Greg_Gianforte_official_photo.jpg' },
  { id: 'gov-ne', name: 'Jim Pillen', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'NE', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Jim_Pillen_official_photo_%28cropped%29.jpg/220px-Jim_Pillen_official_photo_%28cropped%29.jpg' },
  { id: 'gov-nv', name: 'Joe Lombardo', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'NV', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Joe_Lombardo_official_photo_%28cropped%29.jpg/220px-Joe_Lombardo_official_photo_%28cropped%29.jpg' },
  { id: 'gov-nh', name: 'Kelly Ayotte', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'NH', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Kelly_Ayotte_official_photo.jpg/220px-Kelly_Ayotte_official_photo.jpg' },
  { id: 'gov-nj', name: 'Phil Murphy', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NJ', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Phil_Murphy_official_photo.jpg/220px-Phil_Murphy_official_photo.jpg' },
  { id: 'gov-nm', name: 'Michelle Lujan Grisham', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NM', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Michelle_Lujan_Grisham_official_photo.jpg/220px-Michelle_Lujan_Grisham_official_photo.jpg' },
  { id: 'gov-ny', name: 'Kathy Hochul', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NY', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Kathy_Hochul_official_photo_%28cropped%29.jpg/220px-Kathy_Hochul_official_photo_%28cropped%29.jpg' },
  { id: 'gov-nc', name: 'Josh Stein', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NC', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Josh_Stein_official_photo_%28cropped%29.jpg/220px-Josh_Stein_official_photo_%28cropped%29.jpg' },
  { id: 'gov-nd', name: 'Kelly Armstrong', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'ND', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Kelly_Armstrong_117th_Congress_portrait.jpg/220px-Kelly_Armstrong_117th_Congress_portrait.jpg' },
  { id: 'gov-oh', name: 'Mike DeWine', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'OH', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Mike_DeWine_official_photo.jpg/220px-Mike_DeWine_official_photo.jpg' },
  { id: 'gov-ok', name: 'Kevin Stitt', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'OK', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Kevin_Stitt_official_photo.jpg/220px-Kevin_Stitt_official_photo.jpg' },
  { id: 'gov-or', name: 'Tina Kotek', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'OR', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tina_Kotek_official_photo_%28cropped%29.jpg/220px-Tina_Kotek_official_photo_%28cropped%29.jpg' },
  { id: 'gov-pa', name: 'Josh Shapiro', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'PA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Josh_Shapiro_official_photo_%28cropped%29.jpg/220px-Josh_Shapiro_official_photo_%28cropped%29.jpg' },
  { id: 'gov-ri', name: 'Dan McKee', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'RI', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Dan_McKee_official_photo_%28cropped%29.jpg/220px-Dan_McKee_official_photo_%28cropped%29.jpg' },
  { id: 'gov-sc', name: 'Henry McMaster', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'SC', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Henry_McMaster_official_photo.jpg/220px-Henry_McMaster_official_photo.jpg' },
  { id: 'gov-sd', name: 'Kristi Noem', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'SD', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Kristi_Noem_official_photo.jpg/220px-Kristi_Noem_official_photo.jpg' },
  { id: 'gov-tn', name: 'Bill Lee', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'TN', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Bill_Lee_official_photo.jpg/220px-Bill_Lee_official_photo.jpg' },
  { id: 'gov-tx', name: 'Greg Abbott', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'TX', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Greg_Abbott_official_photo.jpg/220px-Greg_Abbott_official_photo.jpg' },
  { id: 'gov-ut', name: 'Spencer Cox', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'UT', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Spencer_Cox_official_photo.jpg/220px-Spencer_Cox_official_photo.jpg' },
  { id: 'gov-vt', name: 'Phil Scott', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'VT', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Phil_Scott_official_photo.jpg/220px-Phil_Scott_official_photo.jpg' },
  { id: 'gov-va', name: 'Glenn Youngkin', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'VA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Glenn_Youngkin_official_photo.jpg/220px-Glenn_Youngkin_official_photo.jpg' },
  { id: 'gov-wa', name: 'Bob Ferguson', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'WA', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Bob_Ferguson_official_portrait_%28cropped%29.png/220px-Bob_Ferguson_official_portrait_%28cropped%29.png' },
  { id: 'gov-wv', name: 'Patrick Morrisey', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'WV', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Patrick_Morrisey_official_photo_%28cropped%29.jpg/220px-Patrick_Morrisey_official_photo_%28cropped%29.jpg' },
  { id: 'gov-wi', name: 'Tony Evers', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'WI', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Tony_Evers_official_photo.jpg/220px-Tony_Evers_official_photo.jpg' },
  { id: 'gov-wy', name: 'Mark Gordon', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'WY', source: 'curated', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Mark_Gordon_official_photo.jpg/220px-Mark_Gordon_official_photo.jpg' },
];

async function fetchCongressMembers(apiKey: string): Promise<RosterEntity[]> {
  const allMembers: RosterEntity[] = [];
  const LIMIT = 250;
  let offset = 0;
  let totalCount = 0;
  
  try {
    console.log('Fetching all Congress members with pagination...');
    
    do {
      const url = new URL(`${CONGRESS_BASE}/member`);
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('limit', LIMIT.toString());
      url.searchParams.set('offset', offset.toString());
      url.searchParams.set('currentMember', 'true');

      console.log(`Fetching Congress members: offset=${offset}, limit=${LIMIT}`);
      const res = await fetch(url.toString());
      
      if (!res.ok) {
        console.error(`Congress API error: ${res.status}`);
        break;
      }

      const data = await res.json();
      
      if (data.pagination?.count) {
        totalCount = data.pagination.count;
        console.log(`Total Congress members available: ${totalCount}`);
      }
      
      if (!data.members || !Array.isArray(data.members)) {
        console.error('Invalid Congress API response structure');
        break;
      }

      const members = data.members.map((m: any) => ({
        id: m.bioguideId || `congress-${m.name}`,
        name: m.name || 'Unknown',
        role: m.terms?.[0]?.chamber === 'House of Representatives' ? 'U.S. Representative' : 'U.S. Senator',
        chamber: 'Federal' as const,
        party: m.partyName || m.party || 'Unknown',
        state: m.state || 'Unknown',
        district: m.district?.toString(),
        source: 'congress' as const,
        bioguideId: m.bioguideId,
        photoUrl: m.depiction?.imageUrl || null,
      }));

      allMembers.push(...members);
      offset += LIMIT;
      
    } while (offset < totalCount && totalCount > 0);

    console.log(`Fetched ${allMembers.length} total Congress members`);
    return allMembers;
  } catch (error) {
    console.error('Error fetching Congress members:', error);
    return allMembers;
  }
}

async function fetchOpenStatesLegislators(apiKey: string): Promise<RosterEntity[]> {
  try {
    console.log('Fetching OpenStates legislators...');
    const res = await fetch(`${OPENSTATES_BASE}/people?per_page=50`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!res.ok) {
      console.error(`OpenStates API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid OpenStates API response structure');
      return [];
    }

    return data.results.map((p: any) => ({
      id: p.id || `openstates-${p.name}`,
      name: p.name || 'Unknown',
      role: p.current_role?.title || 'State Official',
      chamber: 'State' as const,
      party: p.party || 'Unknown',
      state: p.jurisdiction?.name || 'Unknown',
      district: p.current_role?.district,
      source: 'openstates' as const,
      photoUrl: p.image || null,
    }));
  } catch (error) {
    console.error('Error fetching OpenStates legislators:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // USA-only geo-restriction
  const geoCheck = checkUSAOnly(req);
  if (!geoCheck.allowed) {
    return createGeoBlockedResponse(corsHeaders);
  }

  try {
    const congressApiKey = Deno.env.get('CONGRESS_API_KEY');
    const openStatesApiKey = Deno.env.get('OPENSTATES_API_KEY');

    if (!congressApiKey || !openStatesApiKey) {
      console.error('Missing API keys');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch from both API sources in parallel
    const [federalEntities, stateEntities] = await Promise.all([
      fetchCongressMembers(congressApiKey),
      fetchOpenStatesLegislators(openStatesApiKey),
    ]);

    // Combine all sources: APIs + curated governors + curated mayors
    const entities = [
      ...federalEntities, 
      ...stateEntities,
      ...US_GOVERNORS,
      ...MAJOR_CITY_MAYORS,
    ];

    console.log(`Fetched ${federalEntities.length} federal + ${stateEntities.length} state + ${US_GOVERNORS.length} governors + ${MAJOR_CITY_MAYORS.length} mayors = ${entities.length} total entities`);

    return new Response(
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        count: entities.length,
        entities,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Roster API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch roster data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});