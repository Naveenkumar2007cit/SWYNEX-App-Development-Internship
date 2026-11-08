/**
 * DEMO DATA – BusBridge Service Alerts
 * SAMPLE alerts for demonstration only. NOT official MTC advisories.
 */
export const demoAlerts = [
  {
    id: "A001",
    title: "Diversion – Anna Salai (Mount Road)",
    message: "Routes 15B, 27C, and 47A are diverted via Cathedral Road due to road maintenance near Saidapet flyover. Expected to resume normal route by evening.",
    severity: "warning",
    affectedRoutes: ["15B","27C","47A"],
    startDate: "2024-11-02",
    endDate: "2024-11-05",
    isActive: true,
  },
  {
    id: "A002",
    title: "Service Cancellation – Route 19H (Weekend)",
    message: "Route 19H (Tambaram – Velachery) will not operate on Saturday and Sunday. Alternative: Take Route 108 to Guindy, then connect to Route 21E.",
    severity: "critical",
    affectedRoutes: ["19H"],
    startDate: "2024-11-04",
    endDate: "2024-11-05",
    isActive: true,
  },
  {
    id: "A003",
    title: "Additional Buses – Festive Service",
    message: "MTC will operate additional buses on Routes 1A, 5, 70, and 108 during the festive period. Buses will run until 11:00 PM on festival days.",
    severity: "info",
    affectedRoutes: ["1A","5","70","108"],
    startDate: "2024-11-01",
    endDate: "2024-11-04",
    isActive: true,
  },
  {
    id: "A004",
    title: "Delay – Koyambedu Area (Peak Hours)",
    message: "Buses from Koyambedu CMBT may experience 15–20 minute delays during peak hours (8–10 AM and 5–8 PM) due to heavy traffic.",
    severity: "warning",
    affectedRoutes: ["1A","70","M70","52B"],
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    isActive: true,
  },
  {
    id: "A005",
    title: "Stop Shift – Tambaram Terminus",
    message: "The boarding point at Tambaram Terminus has temporarily shifted to Platform 4 (near railway bridge) for Routes 1A, 108 due to renovation work.",
    severity: "info",
    affectedRoutes: ["1A","108"],
    startDate: "2024-10-28",
    endDate: "2024-12-15",
    isActive: true,
  },
];
