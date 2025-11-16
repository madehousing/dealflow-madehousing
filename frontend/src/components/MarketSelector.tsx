import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Market {
  id: number;
  market_code: string;
  market_name: string;
  state: string;
  state_full: string;
  parcel_id_type: string;
  parcel_id_format: string;
}

interface MarketSelectorProps {
  onMarketChange: (market: Market | null) => void;
  selectedMarket?: Market | null;
}

export function MarketSelector({ onMarketChange, selectedMarket }: MarketSelectorProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('is_active', true)
      .order('market_name');

    if (error) {
      console.error('Error loading markets:', error);
      setLoading(false);
      return;
    }

    setMarkets(data || []);
    setLoading(false);
  };

  const handleMarketChange = (marketCode: string) => {
    const market = markets.find(m => m.market_code === marketCode);
    onMarketChange(market || null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="market">Market/Region *</Label>
      <Select
        value={selectedMarket?.market_code || ''}
        onValueChange={handleMarketChange}
        disabled={loading}
      >
        <SelectTrigger id="market">
          <SelectValue placeholder={loading ? "Loading markets..." : "Select market..."} />
        </SelectTrigger>
        <SelectContent>
          {markets.map(market => (
            <SelectItem key={market.market_code} value={market.market_code}>
              {market.market_name} ({market.state})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedMarket && (
        <p className="text-sm text-muted-foreground">
          Parcel ID Type: {selectedMarket.parcel_id_type} - {selectedMarket.parcel_id_format}
        </p>
      )}
    </div>
  );
}
