import Search from "lucide-react/dist/esm/icons/search";
import { SharedSearchInput } from "@/components/search/SharedSearchInput";

interface SearchFormProps {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchForm = ({ loading, onSearch }: SearchFormProps) => {
  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-12">
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="bg-gradient-primary p-2 sm:p-3 rounded-2xl shadow-lg">
            <Search className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
          Find Products <span className="text-gradient">Over Internet</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Search across Amazon, Walmart, Google Shopping, and Home Depot with AI-powered analysis.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <SharedSearchInput 
          variant="hero" 
          loading={loading} 
          onSearch={onSearch}
        />
      </div>
    </div>
  );
};