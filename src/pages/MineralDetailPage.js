import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import './MineralDetailPage.css';

// Used ONLY for fallback matching when exact key doesn't exist.
// Keeps existing behavior intact for all working projects.
const norm = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[“”]/g, '"')
    .replace(/[’']/g, "'")
    .replace(/'/g, '')
    .replace(/[–—]/g, '-')
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim();

function MineralDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notesRef = useRef(null);

  const [mineral, setMineral] = useState(null);
  const [noteMap, setNoteMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const groupedFields = {
    "Project Description": [
      "Primary_Critical_Material",
      "Project_Name",
      "Mining_Method",
      "Co-Producing_Materials",
      "Existing_Mine",
      "Status_of_Project",
      "Regulatory_Challenges"
    ],

    "Location": [
      "State",
      "County",
      "Latitude",
      "Longitude",
      "Nearest_Population_Center",
      "Population_Size",
      "Additional_Location_Information",
      "Mining_District",
      "Mineral_Occurrence"
    ],

    "Developer Description": [
      "Lead_Developer",
      "Location_of_Lead_Developer_HQ",
      "Lead_Developer_Website",
      "Parent_Company",
      "Location_of_Parent_Company_HQ",
      "Was_There_Change_in_Ownership_during_Project?"
    ],

    "Development Plans": [
      "Planned_Production_Capacity_(Thousands_of_Tons/Year)",
      "Planned_Lifespan_of_Mine__(Years)",
      "Processing_Plan_in_US",
      "Processing_Done_by_the_Same_Lead_Developer/Parent_Company",
      "Total_Capital_Costs__(Millions_of_Dollars)"
    ],

    "Financial Support": [
      "Number_of_Federal_Awards",
      "Federal_Agency",
      "Year_Granted",
      "Grant/Loan",
      "Amount__(Millions_of_Dollars)",
      "Purpose_of_Support",
      "Public_Supply_Agreement_w/_an_Automaker_or_Battery/Component_Producer"
    ],

    "Land Ownership": [
      "Type_of_Land",
      "Public_Land_Ownership",
      "Year_of_Land_Acquisition"
    ],

    "Litigation": [
      "Evidence_of_Litigation",
      "Number_of_Cases",
      "State_and/or_Federal",
      "Court_Rulings_Issued",
      "Level_of_Court",
      "Link_to_Judicial_Decision"
    ]
  };

  const [expandedSections, setExpandedSections] = useState(() =>
    Object.keys(groupedFields).reduce((acc, section) => {
      acc[section] = false;
      return acc;
    }, {})
  );

  // Converts database column names into readable labels for users.
  const getReadableLabel = (fieldKey) => {
    return fieldKey
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    Papa.parse('/cleaned_DevCamp_new.csv', {
      header: true,
      download: true,
      complete: (results) => {
        const all = results.data.filter(
          row => row.Latitude && row.Longitude
        );

        const decodedId = decodeURIComponent(id)
          .trim()
          .toLowerCase();

        const match = all.find(
          row =>
            row.Project_Name?.trim().toLowerCase() === decodedId
        );

        if (match) {
          setMineral(match);
        }
      }
    });

    Papa.parse('/Notes_recent.csv', {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const mapping = {};

        rows.forEach(row => {
          const mine = row["Mine/Prospect"]?.trim();

          if (mine) {
            const noteHtml = Object.entries(row)
              .filter(([key, val]) =>
                key !== "Mine/Prospect" &&
                key &&
                val &&
                val.trim() !== '' &&
                val.trim() !== '\n'
              )
              .map(([key, val]) => {
                const cleanVal = val
                  .replace(/[“”]/g, '"')
                  .replace(/[–—]/g, '-')
                  .replace(/[�]/g, '')
                  .trim();

                return `<strong>${key}</strong>: ${cleanVal}`;
              })
              .join("<br/>");

            mapping[mine] = noteHtml;
          }
        });

        setNoteMap(mapping);
      }
    });
  }, [id]);

  if (!mineral) {
    return <div className="loading">Loading...</div>;
  }

  const matchingKey = mineral.Project_Name?.trim();
  let note = noteMap[matchingKey];

  if (!note && matchingKey) {
    const want = norm(matchingKey);
    const entries = Object.entries(noteMap);

    let hit = entries.find(
      ([k]) => norm(k) === want
    );

    if (!hit) {
      hit = entries.find(([k]) => {
        const nk = norm(k);

        return (
          nk.includes(want) ||
          want.includes(nk)
        );
      });
    }

    if (!hit) {
      const toTokens = s =>
        Array.from(
          new Set(
            norm(s)
              .split(' ')
              .filter(Boolean)
          )
        );

      const jaccard = (A, B) => {
        const setA = new Set(A);
        const setB = new Set(B);

        const inter = [...setA]
          .filter(x => setB.has(x))
          .length;

        const uni = new Set([
          ...setA,
          ...setB
        ]).size;

        return uni ? inter / uni : 0;
      };

      const wantTokens = toTokens(matchingKey);

      const best = entries
        .map(([k, v]) => {
          const kt = toTokens(k);

          const score = jaccard(
            wantTokens,
            kt
          );

          const inclBoost =
            norm(k).includes(want) ||
            want.includes(norm(k))
              ? 0.05
              : 0;

          return {
            k,
            v,
            score: score + inclBoost,
            lenDiff: Math.abs(
              norm(k).length - want.length
            )
          };
        })
        .sort(
          (a, b) =>
            (b.score - a.score) ||
            (a.lenDiff - b.lenDiff)
        )[0];

      if (best && best.score >= 0.6) {
        hit = [
          best.k,
          best.v
        ];
      }
    }

    if (hit) {
      note = hit[1];
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();

    setSearchTerm(value);

    const newExpanded = {};

    Object.entries(groupedFields).forEach(
      ([section, keys]) => {
        const matches = keys.some(
          (key) =>
            key.toLowerCase().includes(value) ||
            String(mineral[key] || '')
              .toLowerCase()
              .includes(value)
        );

        newExpanded[section] =
          value ? matches : false;
      }
    );

    setExpandedSections(newExpanded);
  };

  const scrollToNotes = () => {
    if (notesRef.current) {
      notesRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatNotes = (rawNote) => {
    if (!rawNote) {
      return 'No project notes available.';
    }

    const parts = rawNote
      .split('<br/>')
      .filter(part => {
        const content = part
          .replace(/<[^>]+>/g, '')
          .trim();

        return (
          content &&
          !content.endsWith(': N/A')
        );
      });

    if (parts.length === 0) {
      return 'No project notes available.';
    }

    return (
      <div className="notes-list">
        {parts.map((line, idx) => {
          const match = line.match(
            /<strong>(.*?)<\/strong>:\s*(.*)/
          );

          if (!match) {
            return null;
          }

          const [, label, value] = match;

          return (
            <div
              className="note-section"
              key={idx}
            >
              <h3>{label}:</h3>
              <p>{value}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mineral-detail">

      {/* Returns to the page the user came from. */}
      <div className="back-navigation">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <div className="header-row">

        <h1>{mineral.Project_Name}</h1>

        <div className="search-container">

          <input
            type="text"
            placeholder="🔍 Search fields..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-bar improved-search"
          />

          <button
            className="scroll-btn"
            onClick={scrollToNotes}
          >
            Project Notes ⬇
          </button>

        </div>
      </div>

      <div className="section-container">

        {Object.entries(groupedFields).map(
          ([section, keys]) => {

            const visibleFields = keys.filter(
              (key) => {
                const val = mineral[key];

                return (
                  val !== undefined &&
                  (
                    key
                      .toLowerCase()
                      .includes(searchTerm) ||
                    String(val)
                      .toLowerCase()
                      .includes(searchTerm)
                  )
                );
              }
            );

            return (
              <div
                key={section}
                className="section-group"
              >

                <div
                  className="section-header"
                  onClick={() =>
                    toggleSection(section)
                  }
                >
                  {section}

                  <span className="arrow">
                    {expandedSections[section]
                      ? '▲'
                      : '▼'}
                  </span>
                </div>

                {expandedSections[section] && (
                  <div className="grid">

                    {visibleFields.length > 0 ? (

                      visibleFields.map((key) => {
                        const value = mineral[key];

                        const isUrl =
                          typeof value === 'string' &&
                          (
                            value.startsWith('http://') ||
                            value.startsWith('https://')
                          );

                        const readableKey =
                          getReadableLabel(key);

                        const hasNote =
                          note?.includes(
                            `<strong>${readableKey}</strong>`
                          );

                        return (
                          <div
                            className="field-wrapper"
                            key={key}
                          >

                            {hasNote && (
                              <div
                                className="field-asterisk"
                                data-tooltip="See more in Project Notes"
                              >
                                *
                              </div>
                            )}

                            <div className="field">

                              {isUrl ? (
                                <>
                                  <span className="field-label">
                                    {readableKey}:{' '}
                                  </span>

                                  <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-box"
                                  >
                                    {value}
                                  </a>
                                </>
                              ) : (
                                <span className="field-inline">

                                  <span className="field-label">
                                    {readableKey}:{' '}
                                  </span>

                                  <span className="field-value">
                                    {value || 'N/A'}
                                  </span>

                                </span>
                              )}

                            </div>
                          </div>
                        );
                      })

                    ) : (

                      <div className="field">
                        No data available in this section.
                      </div>

                    )}

                  </div>
                )}

              </div>
            );
          }
        )}

      </div>

      <div
        className="notes-section"
        ref={notesRef}
      >

        <h2>Project Notes</h2>

        {note
          ? formatNotes(note)
          : <p>No project notes found.</p>
        }

      </div>

    </div>
  );
}

export default MineralDetailPage;