import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowUpDown, X, ChevronDown } from "lucide-react";
import { searchRoutes, addRecentSearch } from "../services/routeService";
import { allStopNames } from "../data/demoRoutes";
import RouteCard from "../components/RouteCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function BusSearch() {
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo]     = useState(searchParams.get("to") || "");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [fromSuggest, setFromSuggest] = useState([]);
  const [toSuggest, setToSuggest]     = useState([]);

  useEffect(() => {
    if (searchParams.get("from") && searchParams.get("to")) runSearch(searchParams.get("from"), searchParams.get("to"));
  }, []);

  const getSuggestions = (val) =>
    val.length < 2 ? [] : allStopNames.filter((n) => n.toLowerCase().includes(val.toLowerCase())).slice(0, 6);

  const runSearch = async (f, t) => {
    setLoading(true); setSearched(true); setFromSuggest([]); setToSuggest([]);
    const res = await searchRoutes(f, t);
    setResults(res);
    setLoading(false);
    addRecentSearch(f, t);
  };

  const handleSubmit = (e) => { e.preventDefault(); if (from.trim() && to.trim()) runSearch(from, to); };
  const swap = () => { setFrom(to); setTo(from); };
  const clear = () => { setFrom(""); setTo(""); setResults([]); setSearched(false); };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-800">Search Bus Routes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find routes between two Chennai locations</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* From input */}
          <div className="relative">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-50">
              <div className="h-2.5 w-2.5 rounded-full bg-teal-500 flex-shrink-0" />
              <input
                value={from} onChange={(e) => { setFrom(e.target.value); setFromSuggest(getSuggestions(e.target.value)); }}
                onFocus={() => setFromSuggest(getSuggestions(from))}
                onBlur={() => setTimeout(() => setFromSuggest([]), 150)}
                placeholder="From – starting location"
                className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400"
              />
              {from && <button type="button" onClick={() => { setFrom(""); setFromSuggest([]); }}><X className="h-4 w-4 text-gray-300" /></button>}
            </div>
            {fromSuggest.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-20 overflow-hidden">
                {fromSuggest.map((s) => (
                  <button key={s} type="button" onMouseDown={() => { setFrom(s); setFromSuggest([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 flex-shrink-0" />{s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button type="button" onClick={swap} className="p-2 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-600 text-gray-500 transition-colors">
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* To input */}
          <div className="relative">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-50">
              <div className="h-2.5 w-2.5 rounded-full bg-navy-700 flex-shrink-0" />
              <input
                value={to} onChange={(e) => { setTo(e.target.value); setToSuggest(getSuggestions(e.target.value)); }}
                onFocus={() => setToSuggest(getSuggestions(to))}
                onBlur={() => setTimeout(() => setToSuggest([]), 150)}
                placeholder="To – destination"
                className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400"
              />
              {to && <button type="button" onClick={() => { setTo(""); setToSuggest([]); }}><X className="h-4 w-4 text-gray-300" /></button>}
            </div>
            {toSuggest.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-20 overflow-hidden">
                {toSuggest.map((s) => (
                  <button key={s} type="button" onMouseDown={() => { setTo(s); setToSuggest([]); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-navy-400 flex-shrink-0" />{s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={!from.trim() || !to.trim()}
              className="flex-1 bg-navy-800 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
              <Search className="h-4 w-4" />Search Routes
            </button>
            {searched && (
              <button type="button" onClick={clear} className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm transition-colors">
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {loading && <LoadingSpinner text="Searching routes..." />}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No routes found</h3>
          <p className="text-sm text-gray-400">Try different locations or check the spelling.</p>
          <p className="text-xs text-gray-300 mt-2">Demo data covers major Chennai stops only.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">{results.length} route{results.length !== 1 ? "s" : ""} found</h2>
            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">Sample data</span>
          </div>
          <div className="space-y-3">
            {results.map((route) => <RouteCard key={route.id} route={route} />)}
          </div>
        </div>
      )}

      {/* Popular searches */}
      {!searched && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Popular Routes</h2>
          <div className="grid grid-cols-2 gap-2">
            {[["Tambaram","Broadway"],["Koyambedu","Velachery"],["T. Nagar","Adyar"],["Guindy","T. Nagar"],["Anna Nagar","Broadway"],["Velachery","T. Nagar"]].map(([f,t]) => (
              <button key={`${f}-${t}`} onClick={() => { setFrom(f); setTo(t); runSearch(f, t); }}
                className="bg-white rounded-xl shadow-card border border-gray-100 px-3 py-2.5 text-left hover:shadow-card-hover transition-all">
                <p className="text-xs font-medium text-navy-700">{f}</p>
                <p className="text-xs text-gray-400 mt-0.5">→ {t}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
