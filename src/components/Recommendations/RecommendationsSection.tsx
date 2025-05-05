import RecommendationCard from "./RecommendationCard";

interface RecommendedStock {
  symbol: string;
  name: string;
  performance: string;
  reason: string;
}

interface RecommendationsSectionProps {
  stocks: RecommendedStock[];
}

const RecommendationsSection = ({ stocks }: RecommendationsSectionProps) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              為您推薦
            </h2>
            <p className="mt-2 text-gray-600">根據您的關注與投資偏好</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stocks.map((stock) => (
            <RecommendationCard key={stock.symbol} {...stock} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationsSection;
