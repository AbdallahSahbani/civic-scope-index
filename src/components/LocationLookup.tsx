import { useState } from 'react';
import { useGeocoder } from '@/hooks/useGeocoder';
import { RepresentativeCard } from '@/components/RepresentativeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Search, 
  MapPin, 
  Landmark, 
  Building2,
  AlertCircle,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export function LocationLookup() {
  const [address, setAddress] = useState('');
  const [zipcode, setZipcode] = useState('');
  const { data, loading, error, lookupByAddress, lookupByBrowserLocation, reset } = useGeocoder();

  const handleAddressLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim() && zipcode.trim()) {
      await lookupByAddress(address.trim(), zipcode.trim());
    }
  };

  const handleLocationLookup = async () => {
    await lookupByBrowserLocation();
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-serif text-xl font-medium text-foreground mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Find Your Representatives
        </h3>

        <Tabs defaultValue="address" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="address" className="gap-2">
              <Search className="h-4 w-4" />
              Address
            </TabsTrigger>
            <TabsTrigger value="location" className="gap-2">
              <Navigation className="h-4 w-4" />
              My Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="address">
            <form onSubmit={handleAddressLookup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="1600 Pennsylvania Avenue NW"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zipcode">ZIP Code</Label>
                  <Input
                    id="zipcode"
                    placeholder="20500"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="mt-1"
                    maxLength={5}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading || !address.trim() || !zipcode.trim()}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Representatives
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="location">
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-4">
                Allow location access to automatically find your representatives based on your current location.
              </p>
              <Button
                onClick={handleLocationLookup}
                disabled={loading}
                variant="secondary"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    Use My Location
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Lookup Failed</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reset}
              className="mt-3"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {data && data.success && (
        <div className="space-y-6">
          {/* Verified Location */}
          {data.location && (
            <div className="bg-accent/50 border border-accent rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  Location Verified
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.location.address && `${data.location.address}, `}
                  {data.location.city}, {data.location.stateAbbr} {data.location.zipCode}
                </p>
                {data.location.county && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {data.location.county} County
                  </p>
                )}
              </div>
            </div>
          )}

          {/* District Badges */}
          {data.congressional && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                <Landmark className="h-4 w-4" />
                {data.congressional.districtName || `${data.congressional.state}-${data.congressional.districtId}`}
              </Badge>
              {data.localInfo?.votingDistrict && (
                <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                  Voting District: {data.localInfo.votingDistrict}
                </Badge>
              )}
              {data.localInfo?.schoolDistrict && (
                <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                  School District: {data.localInfo.schoolDistrict}
                </Badge>
              )}
            </div>
          )}

          {/* Federal Representatives */}
          {data.representatives.length > 0 && (
            <div>
              <h4 className="font-serif text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Federal Representatives
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.representatives.map((official, idx) => (
                  <RepresentativeCard key={`fed-${idx}`} official={official} />
                ))}
              </div>
            </div>
          )}

          {/* State Officials */}
          {data.stateOfficials.length > 0 && (
            <div>
              <h4 className="font-serif text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                State Officials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.stateOfficials.map((official, idx) => (
                  <RepresentativeCard key={`state-${idx}`} official={official} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {data.representatives.length === 0 && data.stateOfficials.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No representatives found for this location.
              </p>
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center">
            <Button variant="ghost" onClick={reset} className="text-muted-foreground">
              Search another location
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
