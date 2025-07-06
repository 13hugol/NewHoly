# SuperAdmin Panel

The SuperAdmin panel is a private tool for the platform owner to manage and access all client school admin panels.

- **Purpose:**
  - Store and manage database URLs for each school.
  - Provide a secure interface to switch between and access all school admin panels.
  - No school design or content management is included here—this is strictly for super admin use.

## How it Works
- Add each school's info (name, database URL, admin panel URL) to the config file.
- Use the SuperAdmin panel to instantly access any school's admin panel.
- Each school's backend connects only to its own database.

## Usage
- Keep this folder and its files private.
- Do not include demo data or school content here.
- To add a new school, update the config file and deploy the school's admin panel/backend as needed. 