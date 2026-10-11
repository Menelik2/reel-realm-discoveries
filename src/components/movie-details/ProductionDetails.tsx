import { Card, CardContent } from '@/components/ui/card';

interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface SpokenLanguage {
  english_name: string;
  name: string;
}

interface ProductionDetailsProps {
  budget: number;
  revenue: number;
  productionCountries: ProductionCountry[];
  spokenLanguages: SpokenLanguage[];
  productionCompanies: ProductionCompany[];
}

export const ProductionDetails = ({
  budget,
  revenue,
  productionCountries,
  spokenLanguages,
  productionCompanies
}: ProductionDetailsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      notation: amount >= 1_000_000 ? 'compact' : 'standard',
    }).format(amount);
  };

  const hasProductionInfo = budget > 0 || revenue > 0 || productionCountries?.length > 0 || spokenLanguages?.length > 0;
  const hasCompanies = productionCompanies?.length > 0;

  if (!hasProductionInfo && !hasCompanies) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {hasProductionInfo && (
        <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3 text-foreground">Production Details</h3>
            <div className="space-y-2.5 text-sm">
              {budget > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium tabular-nums">{formatCurrency(budget)}</span>
                </div>
              )}
              {revenue > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium tabular-nums">{formatCurrency(revenue)}</span>
                </div>
              )}
              {productionCountries?.length > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Countries</span>
                  <span className="font-medium text-right">{productionCountries.map(c => c.name).join(', ')}</span>
                </div>
              )}
              {spokenLanguages?.length > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Languages</span>
                  <span className="font-medium text-right">{spokenLanguages.map(l => l.english_name).join(', ')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasCompanies && (
        <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3 text-foreground">Production Companies</h3>
            <div className="space-y-3">
              {productionCompanies.slice(0, 5).map(company => (
                <div key={company.id} className="flex items-center gap-3">
                  {company.logo_path ? (
                    <div className="h-8 w-12 flex items-center justify-center bg-secondary/60 rounded-lg px-1.5">
                      <img
                        src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                        alt=""
                        className="max-h-6 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-12 rounded-lg bg-secondary/60" />
                  )}
                  <span className="text-sm font-medium">{company.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
