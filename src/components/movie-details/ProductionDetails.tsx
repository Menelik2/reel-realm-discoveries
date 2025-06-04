
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
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Production Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Production Details</h3>
          <div className="space-y-2 text-sm">
            {budget > 0 && (
              <div>
                <span className="font-medium">Budget:</span> {formatCurrency(budget)}
              </div>
            )}
            {revenue > 0 && (
              <div>
                <span className="font-medium">Revenue:</span> {formatCurrency(revenue)}
              </div>
            )}
            <div>
              <span className="font-medium">Countries:</span> {productionCountries.map(c => c.name).join(', ')}
            </div>
            <div>
              <span className="font-medium">Languages:</span> {spokenLanguages.map(l => l.english_name).join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Companies */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Production Companies</h3>
          <div className="space-y-2">
            {productionCompanies.slice(0, 5).map(company => (
              <div key={company.id} className="flex items-center gap-2">
                {company.logo_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                    alt={company.name}
                    className="h-8 w-auto"
                  />
                )}
                <span className="text-sm">{company.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
