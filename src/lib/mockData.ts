import { Entity } from './types';

export const mockEntities: Entity[] = [
  {
    id: 'official-001',
    name: 'Maria T. Gonzalez',
    entityType: 'elected_official',
    state: 'CA',
    jurisdiction: 'federal',
    office: 'U.S. Representative, 34th District',
    metrics: {
      activity: {
        level: 'high',
        description: 'Sponsored 12 bills in current session',
        timePeriod: 'Jan 2024 – Present',
      },
      visibility: {
        level: 'moderate',
        description: 'Featured in 45 news articles',
        timePeriod: 'Last 90 days',
      },
      sourceCoverage: {
        level: 'high',
        description: 'Covered by 28 distinct outlets',
        timePeriod: 'Last 12 months',
      },
      lastUpdated: '2026-01-09',
    },
    evidenceLinks: [
      {
        id: 'ev-001',
        title: 'H.R. 4521 - Infrastructure Investment Act',
        source: 'Congress.gov',
        url: 'https://congress.gov',
        dateAccessed: '2026-01-08',
        category: 'Legislative Record',
      },
      {
        id: 'ev-002',
        title: 'Committee Hearing Testimony',
        source: 'House.gov',
        url: 'https://house.gov',
        dateAccessed: '2026-01-07',
        category: 'Public Statements',
      },
    ],
  },
  {
    id: 'official-002',
    name: 'Robert J. Chen',
    entityType: 'elected_official',
    state: 'TX',
    jurisdiction: 'state',
    office: 'State Senator, District 15',
    metrics: {
      activity: {
        level: 'moderate',
        description: 'Sponsored 4 bills in current session',
        timePeriod: 'Jan 2024 – Present',
      },
      visibility: {
        level: 'low',
        description: 'Featured in 12 news articles',
        timePeriod: 'Last 90 days',
      },
      sourceCoverage: {
        level: 'moderate',
        description: 'Covered by 9 distinct outlets',
        timePeriod: 'Last 12 months',
      },
      lastUpdated: '2026-01-08',
    },
    evidenceLinks: [
      {
        id: 'ev-003',
        title: 'Senate Bill 1234',
        source: 'Texas Legislature Online',
        url: 'https://capitol.texas.gov',
        dateAccessed: '2026-01-06',
        category: 'Legislative Record',
      },
    ],
  },
  {
    id: 'journalist-001',
    name: 'Sarah M. Patterson',
    entityType: 'journalist',
    state: 'NY',
    outlet: 'The New York Times',
    beat: 'National Politics',
    metrics: {
      activity: {
        level: 'high',
        description: 'Published 34 articles',
        timePeriod: 'Last 90 days',
      },
      visibility: {
        level: 'high',
        description: 'Articles shared 12,400 times',
        timePeriod: 'Last 90 days',
      },
      sourceCoverage: {
        level: 'high',
        description: 'Cited 156 distinct sources',
        timePeriod: 'Last 12 months',
      },
      lastUpdated: '2026-01-09',
    },
    evidenceLinks: [
      {
        id: 'ev-004',
        title: 'Author Archive',
        source: 'The New York Times',
        url: 'https://nytimes.com',
        dateAccessed: '2026-01-09',
        category: 'Published Work',
      },
    ],
  },
  {
    id: 'journalist-002',
    name: 'David L. Thompson',
    entityType: 'journalist',
    state: 'DC',
    outlet: 'The Washington Post',
    beat: 'Congressional Coverage',
    metrics: {
      activity: {
        level: 'moderate',
        description: 'Published 18 articles',
        timePeriod: 'Last 90 days',
      },
      visibility: {
        level: 'moderate',
        description: 'Articles shared 4,200 times',
        timePeriod: 'Last 90 days',
      },
      sourceCoverage: {
        level: 'high',
        description: 'Cited 89 distinct sources',
        timePeriod: 'Last 12 months',
      },
      lastUpdated: '2026-01-08',
    },
    evidenceLinks: [
      {
        id: 'ev-005',
        title: 'Author Profile',
        source: 'The Washington Post',
        url: 'https://washingtonpost.com',
        dateAccessed: '2026-01-08',
        category: 'Published Work',
      },
    ],
  },
  {
    id: 'media-001',
    name: 'Associated Press',
    entityType: 'media_organization',
    state: 'NY',
    metrics: {
      activity: {
        level: 'high',
        description: 'Published 2,340 U.S. political articles',
        timePeriod: 'Last 90 days',
      },
      visibility: {
        level: 'high',
        description: 'Content syndicated to 1,200+ outlets',
        timePeriod: 'Last 90 days',
      },
      sourceCoverage: {
        level: 'high',
        description: 'Maintained 420 active correspondents',
        timePeriod: 'Current',
      },
      lastUpdated: '2026-01-09',
    },
    evidenceLinks: [
      {
        id: 'ev-006',
        title: 'AP Fact Check Archive',
        source: 'Associated Press',
        url: 'https://apnews.com',
        dateAccessed: '2026-01-09',
        category: 'Published Work',
      },
    ],
  },
  {
    id: 'media-002',
    name: 'Reuters U.S.',
    entityType: 'media_organization',
    state: 'NY',
    metrics: {
      activity: {
        level: 'high',
        description: 'Published 1,890 U.S. political articles',
        timePeriod: 'Last 90 days',
      },
      visibility: {
        level: 'high',
        description: 'Content syndicated to 900+ outlets',
        timePeriod: 'Last 90 days',
      },
      sourceCoverage: {
        level: 'high',
        description: 'Maintained 280 active correspondents',
        timePeriod: 'Current',
      },
      lastUpdated: '2026-01-09',
    },
    evidenceLinks: [
      {
        id: 'ev-007',
        title: 'Reuters U.S. Politics',
        source: 'Reuters',
        url: 'https://reuters.com',
        dateAccessed: '2026-01-09',
        category: 'Published Work',
      },
    ],
  },
  {
    id: 'official-003',
    name: 'Jennifer A. Williams',
    entityType: 'elected_official',
    state: 'FL',
    jurisdiction: 'local',
    office: 'Mayor, City of Tampa',
    metrics: {
      activity: {
        level: 'moderate',
        description: 'Issued 8 executive orders',
        timePeriod: 'Last 12 months',
      },
      visibility: {
        level: 'moderate',
        description: 'Featured in 67 news articles',
        timePeriod: 'Last 90 days',
      },
      sourceCoverage: {
        level: 'moderate',
        description: 'Covered by 15 distinct outlets',
        timePeriod: 'Last 12 months',
      },
      lastUpdated: '2026-01-07',
    },
    evidenceLinks: [
      {
        id: 'ev-008',
        title: 'City of Tampa Official Records',
        source: 'City of Tampa',
        url: 'https://tampa.gov',
        dateAccessed: '2026-01-07',
        category: 'Official Records',
      },
    ],
  },
];

export function getEntityById(id: string): Entity | undefined {
  return mockEntities.find(entity => entity.id === id);
}

export function filterEntities(
  entities: Entity[],
  filters: {
    search?: string;
    entityType?: string;
    state?: string;
    jurisdiction?: string;
  }
): Entity[] {
  return entities.filter(entity => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = entity.name.toLowerCase().includes(searchLower);
      const matchesOffice = entity.office?.toLowerCase().includes(searchLower);
      const matchesOutlet = entity.outlet?.toLowerCase().includes(searchLower);
      const matchesBeat = entity.beat?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesOffice && !matchesOutlet && !matchesBeat) {
        return false;
      }
    }

    // Entity type filter
    if (filters.entityType && filters.entityType !== 'all') {
      if (entity.entityType !== filters.entityType) {
        return false;
      }
    }

    // State filter
    if (filters.state && filters.state !== 'ALL') {
      if (entity.state !== filters.state) {
        return false;
      }
    }

    // Jurisdiction filter (only for elected officials)
    if (filters.jurisdiction && filters.jurisdiction !== 'all') {
      if (entity.entityType === 'elected_official') {
        if (entity.jurisdiction !== filters.jurisdiction) {
          return false;
        }
      }
    }

    return true;
  });
}
