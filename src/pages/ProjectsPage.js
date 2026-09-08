import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ProjectsPage.css';
import Papa from 'papaparse';

const mineralList = [
  'Lithium',
  'Copper',
  'Cobalt',
  'Nickel',
  'Graphite',
  'Neodymium',
  'Manganese'
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);

  // Keeps the selected mineral in the URL.
  const [searchParams, setSearchParams] = useSearchParams();

  // Restores the selected mineral from the URL.
  const [filteredMineral, setFilteredMineral] = useState(
    searchParams.get('mineral')
  );

  // Stores the project-name search text.
  const [searchTerm, setSearchTerm] = useState('');

  // Stores the selected sorting option.
  const [sortBy, setSortBy] = useState('');

  // Stores the sorting direction.
  const [sortOrder, setSortOrder] = useState('desc');

  // Load project data from the CSV.
  useEffect(() => {
    fetch('/cleaned_DevCamp_new.csv')
      .then(response => response.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setProjects(results.data);
          }
        });
      })
      .catch(error => {
        console.error('Error loading project data:', error);
      });
  }, []);

  // Keep the selected mineral synchronized with the URL.
  useEffect(() => {
    setFilteredMineral(searchParams.get('mineral'));
  }, [searchParams]);

  // Select a mineral.
  const handleMineralClick = (mineral) => {
    setFilteredMineral(mineral);
    setSearchTerm('');
    setSortBy('');
    setSortOrder('desc');

    setSearchParams({ mineral });
  };

  // Return to the mineral-selection page.
  const handleBack = () => {
    setFilteredMineral(null);
    setSearchTerm('');
    setSortBy('');
    setSortOrder('desc');

    setSearchParams({});
  };

  // Handle project-name search.
  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchTerm(value);
    setFilteredMineral(null);
    setSortBy('');
    setSortOrder('desc');

    setSearchParams({});
  };

  // Convert CSV values to numbers.
  const parseNumber = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return null;
    }

    const cleanedValue = String(value)
      .replace(/[$,%\s,]/g, '')
      .trim();

    const number = Number(cleanedValue);

    return Number.isFinite(number)
      ? number
      : null;
  };

  // Filter projects according to the selected mineral and search term.
  const filteredProjects = projects.filter((project) => {
    const name =
      project["Project_Name"]?.toLowerCase().trim();

    const mineral =
      project["Primary_Critical_Material"]?.trim();

    const matchesSearch =
      searchTerm === '' ||
      name?.includes(searchTerm.toLowerCase());

    const matchesMineral =
      !filteredMineral ||
      mineral === filteredMineral;

    return matchesSearch && matchesMineral;
  });

  // Apply Capital Cost ranking when selected.
  const rankedProjects = (() => {
    // Keep the original ordering when no sorting is selected.
    if (sortBy !== 'capitalCost') {
      return [...filteredProjects];
    }

    // Convert projects into sortable objects.
    return filteredProjects
      .map((project) => ({
        project,
        capitalCost: parseNumber(
          project[
            "Total_Capital_Costs__(Millions_of_Dollars)"
          ]
        )
      }))

      // Remove projects with no capital-cost estimate.
      .filter(
        item => item.capitalCost !== null
      )

      // Sort by the numeric capital-cost value.
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.capitalCost - b.capitalCost;
        }

        return b.capitalCost - a.capitalCost;
      })

      // Return the original project objects.
      .map(item => item.project);
  })();

  // Determines whether the results view is active.
  const showingResults =
    filteredMineral || searchTerm;

  return (
    <div className="projects-split-page">

      {/* Left Panel */}
      <div className="projects-left-panel">

        {/* Show Back only while viewing results. */}
        {showingResults && (
          <button
            className="projects-back-btn"
            onClick={handleBack}
          >
            ← Back
          </button>
        )}

        <h1>
          Explore Projects by Mineral
        </h1>

        <p className="projects-subtext">
          Search or select a mineral to explore U.S. critical material projects.
        </p>

        <input
          type="text"
          placeholder="Search projects by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="projects-search-input"
        />

      </div>

      {/* Right Panel */}
      <div className="projects-right-panel">

        {/* Mineral Selection */}
        {!showingResults && (
          <div className="vertical-mineral-list">

            {mineralList.map((mineral) => (
              <div
                key={mineral}
                className="vertical-mineral-box"
                onClick={() =>
                  handleMineralClick(mineral)
                }
              >
                {mineral}
              </div>
            ))}

          </div>
        )}

        {/* Project Results */}
        {showingResults && (
          <div className="project-section">

            {/* Title and sorting controls share one row. */}
            <div className="project-header-row">

              <h2>
                {filteredMineral || 'Search Results'} Projects
              </h2>

              {/* Sorting controls */}
              <div className="project-sort-controls">

                {/* Sort By */}
                <div className="sort-control-group">

                  <label htmlFor="sortBy">
                    Sort by
                  </label>

                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);

                      // Start Capital Cost at highest to lowest.
                      setSortOrder('desc');
                    }}
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="capitalCost">
                      Capital Cost
                    </option>
                  </select>

                </div>

                {/* Order */}
                <div className="sort-control-group">

                  <label htmlFor="sortOrder">
                    Order
                  </label>

                  <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value)
                    }
                  >
                    <option value="desc">
                      Highest to Lowest
                    </option>

                    <option value="asc">
                      Lowest to Highest
                    </option>
                  </select>

                </div>

              </div>

            </div>

            {/* No matching projects */}
            {rankedProjects.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  color: 'gray'
                }}
              >
                {sortBy === 'capitalCost'
                  ? 'No projects with a capital cost estimate were found.'
                  : 'No projects found.'}
              </p>
            ) : (

              /* Project Cards */
              <div className="project-list">

                {rankedProjects.map(
                  (project, index) => {

                    const encodedName =
                      encodeURIComponent(
                        project.Project_Name?.trim()
                      );

                    return (
                      <Link
                        to={`/mineral/${encodedName}`}
                        key={index}
                        style={{
                          textDecoration: 'none'
                        }}
                      >

                        <div className="project-card">

                          <h3>
                            {project.Project_Name}
                          </h3>

                          <p>
                            <strong>
                              Mineral:
                            </strong>{' '}
                            {project[
                              "Primary_Critical_Material"
                            ]}
                          </p>

                          <p>
                            <strong>
                              Status:
                            </strong>{' '}
                            {project.Status_of_Project}
                          </p>

                          <p>
                            <strong>
                              Location:
                            </strong>{' '}

                            {project.State
                              ? project.County
                                ? `${project.County}, ${project.State}`
                                : project.State
                              : 'Location not available'}
                          </p>

                          {/* Show capital cost only while ranking. */}
                          {sortBy === 'capitalCost' && (
                            <p>
                              <strong>
                                Capital Cost:
                              </strong>{' '}

                              {parseNumber(
                                project[
                                  "Total_Capital_Costs__(Millions_of_Dollars)"
                                ]
                              ) !== null
                                ? `$${parseNumber(
                                    project[
                                      "Total_Capital_Costs__(Millions_of_Dollars)"
                                    ]
                                  )}M`
                                : 'No estimate'}
                            </p>
                          )}

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectsPage;