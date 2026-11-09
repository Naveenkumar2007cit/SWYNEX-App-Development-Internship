import { useState, useEffect } from "react";
import {
  getSavedRoutes,
  isRouteSaved,
  saveRoute as serviceSaveRoute,
  unsaveRoute as serviceUnsaveRoute,
  clearAllSavedRoutes as serviceClearAll,
  SAVED_ROUTES_CHANGE_EVENT,
} from "../services/savedRoutesService";

/**
 * Custom hook to manage saved bus routes across the application
 */
export function useSavedRoutes() {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'warning' | 'error' | 'info', message: string }

  const refreshSaved = async () => {
    try {
      const routes = await getSavedRoutes();
      setSavedRoutes(routes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSaved();

    const handleStorageChange = () => {
      refreshSaved();
    };

    window.addEventListener(SAVED_ROUTES_CHANGE_EVENT, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(SAVED_ROUTES_CHANGE_EVENT, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const save = async (route) => {
    const res = await serviceSaveRoute(route);
    if (res.success) {
      showFeedback("success", res.message);
      refreshSaved();
      return true;
    } else if (res.alreadySaved) {
      showFeedback("warning", res.message);
      return false;
    } else {
      showFeedback("error", res.message);
      return false;
    }
  };

  const remove = async (routeId) => {
    const res = await serviceUnsaveRoute(routeId);
    if (res.success) {
      showFeedback("info", res.message);
      refreshSaved();
      return true;
    }
    return false;
  };

  const clearAll = () => {
    const res = serviceClearAll();
    showFeedback("info", res.message);
    refreshSaved();
  };

  const isSaved = (routeId) => isRouteSaved(routeId);

  const clearFeedback = () => setFeedback(null);

  return {
    savedRoutes,
    loading,
    feedback,
    saveRoute: save,
    removeRoute: remove,
    clearAll,
    isSaved,
    clearFeedback,
    refreshSaved,
  };
}
