
// Mock data for development purposes
// In real application, this would come from an API

// Helper function to get date for a specific number of days from today
const getDateFromToday = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  // Skip weekends
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) { // Sunday
    date.setDate(date.getDate() + 1);
  } else if (dayOfWeek === 6) { // Saturday
    date.setDate(date.getDate() + 2);
  }
  return date;
};

// Sample logistics events
export const logisticsEvents = [
  {
    type: "delivery" as const,
    date: new Date(), // Today
    projectNumber: "PRJ-2024-001",
    projectName: "City Center Office Building",
    location: "123 Main St, Downtown",
    time: "09:30 AM"
  },
  {
    type: "pickup" as const,
    date: new Date(), // Today
    projectNumber: "PRJ-2024-003",
    projectName: "Riverside Apartments",
    location: "456 River Rd, Eastside",
    time: "02:15 PM"
  },
  {
    type: "delivery" as const,
    date: getDateFromToday(1),
    projectNumber: "PRJ-2024-002",
    projectName: "Metro Station Renovation",
    location: "789 Transit Way, Downtown",
    time: "10:00 AM"
  },
  {
    type: "pickup" as const,
    date: getDateFromToday(2),
    projectNumber: "PRJ-2024-005",
    projectName: "Harbor View Hotel",
    location: "321 Harbor Dr, Waterfront",
    time: "08:45 AM"
  },
  {
    type: "delivery" as const,
    date: getDateFromToday(2),
    projectNumber: "PRJ-2024-007",
    projectName: "Community Health Center",
    location: "555 Wellness Ave, Northside",
    time: "11:30 AM"
  },
  {
    type: "delivery" as const,
    date: getDateFromToday(3),
    projectNumber: "PRJ-2024-004",
    projectName: "Tech Park Phase II",
    location: "888 Innovation Blvd, Tech District",
    time: "09:00 AM"
  },
  {
    type: "pickup" as const,
    date: getDateFromToday(4),
    projectNumber: "PRJ-2024-008",
    projectName: "Sports Complex Extension",
    location: "777 Athletic Dr, Westside",
    time: "03:30 PM"
  },
  {
    type: "delivery" as const,
    date: getDateFromToday(5),
    projectNumber: "PRJ-2024-009",
    projectName: "University Science Building",
    location: "101 Campus Dr, University District",
    time: "10:45 AM"
  },
  {
    type: "pickup" as const,
    date: getDateFromToday(5),
    projectNumber: "PRJ-2024-006",
    projectName: "Green Valley Residential",
    location: "222 Valley Rd, Southside",
    time: "01:15 PM"
  }
];

// Sample projects
export const projects = [
  {
    id: "PRJ-2024-001",
    name: "City Center Office Building",
    status: "active" as const,
    progress: 35,
    documentationDone: false,
    materialsOrdered: true,
    materialsReceived: false
  },
  {
    id: "PRJ-2024-002",
    name: "Metro Station Renovation",
    status: "active" as const,
    progress: 68,
    documentationDone: true,
    materialsOrdered: true,
    materialsReceived: false
  },
  {
    id: "PRJ-2024-003",
    name: "Riverside Apartments",
    status: "active" as const,
    progress: 12,
    documentationDone: false,
    materialsOrdered: false,
    materialsReceived: false
  },
  {
    id: "PRJ-2024-004",
    name: "Tech Park Phase II",
    status: "active" as const,
    progress: 89,
    documentationDone: true,
    materialsOrdered: true,
    materialsReceived: true
  },
  {
    id: "PRJ-2024-005",
    name: "Harbor View Hotel",
    status: "active" as const,
    progress: 24,
    documentationDone: true,
    materialsOrdered: false,
    materialsReceived: false
  },
  {
    id: "PRJ-2024-006",
    name: "Green Valley Residential",
    status: "active" as const,
    progress: 56,
    documentationDone: true,
    materialsOrdered: true,
    materialsReceived: true
  },
  {
    id: "PRJ-2024-007",
    name: "Community Health Center",
    status: "active" as const,
    progress: 42,
    documentationDone: false,
    materialsOrdered: true,
    materialsReceived: false
  },
  {
    id: "PRJ-2024-008",
    name: "Sports Complex Extension",
    status: "active" as const,
    progress: 18,
    documentationDone: false,
    materialsOrdered: false,
    materialsReceived: false
  },
  {
    id: "PRJ-2024-009",
    name: "University Science Building",
    status: "active" as const,
    progress: 75,
    documentationDone: true,
    materialsOrdered: true,
    materialsReceived: false
  }
];
