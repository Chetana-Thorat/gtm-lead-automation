import React, { useEffect } from 'react';
import './UserGuidePage.css';
import { useNavigate } from 'react-router-dom';

const UserGuidePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    const cards = document.querySelectorAll('.info-card, .field-box');
    cards.forEach(card => observer.observe(card));

    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, []);

  return (
    <>
      {/* ========= SECTION 1: Main User Guide Overview ========= */}
      <div className="user-guide-grid" id="user-guide-top">
        <div className="left-panel">
          <h1>User Guide for DEV-CaMP Website</h1>
          <p className="date">Updated June 3, 2025</p>
          <a href="/user_guide.docx.pdf" download="DEV-CaMP-UserGuide.pdf" className="download-button">
            Download User Guide
          </a>
        </div>

        <div className="right-panel">
          <div className="info-card">
            <h3>Purpose</h3>
            <p>
              DEV-CaMP provides detailed profiles of U.S.-based critical mineral mining projects to support research, policy,
              and public understanding of the emerging critical materials industry.
            </p>
          </div>

          <div className="info-card">
            <h3>What Sets DEV-CaMP Apart</h3>
            <p>
              Unlike other databases, DEV-CaMP includes federal financial support, regulatory history, public opposition/support,
              litigation, and community perspectives.
            </p>
          </div>

          <div className="info-card">
            <h3>Project Fields</h3>
            <p>
              Each project includes 13 fields such as Description, Developer Info, Financial Support, Land Ownership, Statements,
              Litigation, and Community Groups.
            </p>
          </div>

          <div className="info-card">
            <h3>Critical Materials</h3>
            <p>
              Projects involve seven key minerals: lithium, cobalt, graphite, nickel, manganese, neodymium, and copper (DOE-designated).
            </p>
          </div>

          <div className="info-card">
            <h3>Ongoing Updates</h3>
            <p>
              Mining and processing are dynamic sectors. DEV-CaMP is updated periodically to reflect new projects and revised data
              (latest: Jan 2025).
            </p>
          </div>

          <div className="info-card">
            <h3>Get in Touch</h3>
            <p>
              To suggest corrections or request unreleased data, email <a href="mailto:grahamjd@iu.edu">grahamjd@iu.edu</a>.
            </p>
          </div>
        </div>
      </div>

      {/* ========= SECTION 2: Fields in DEV-CaMP ========= */}
      <div className="user-guide-fields-grid">
        <div className="fields-left-panel">
          {[
            {
              title: "Project Description",
              text: "Captures key data such as the primary material, project name, mining method, co-producing materials, site history, project status, and regulatory challenges."
            },
            {
              title: "Location",
              text: "Includes state, county, nearest population center, population size, mining district, mineral occurrence, and additional location details."
            },
            {
              title: "Developer Description",
              text: "Profiles the lead developer, their HQ, website, parent company (if any), and ownership changes throughout the project lifecycle."
            },
            {
              title: "Development Plans",
              text: "Describes production capacity, lifespan, processing location (US/NA), capital costs, and the company handling processing."
            },
            {
              title: "Financial Support",
              text: "Tracks federal awards (grants/loans), agencies involved, year, amount, purpose, and public supply agreements."
            },
            {
              title: "Land Ownership",
              text: "Details public/private land use, land acquisition year, and land management agencies (e.g., BLM, USFS)."
            },
            {
              title: "Statements of Support from Public Officials",
              text: "Flags public endorsements from local, state, or federal officials based on project-related statements."
            },
            {
              title: "Statements of Concern from Public Officials",
              text: "Highlights concerns raised by local, state, or federal officials based on publicly available statements."
            },
            {
              title: "Litigation",
              text: "Captures evidence of lawsuits, number of cases, level of court, rulings, and links to judicial decisions."
            },
            {
              title: "Concerned Interest Groups",
              text: "Identifies opposition from residents, Indigenous, environmental, commercial, and recreational groups; protest evidence included."
            },
            {
              title: "Reasons for Concern",
              text: "Outlines concerns like land use, environment, noise, water, species impact, waste, engagement, and more."
            },
            {
              title: "Supportive Interest Groups / Reasons for Support",
              text: "Documents supportive groups and reasons such as jobs, tax benefits, national security, clean energy, and local development."
            }
          ].map((field, index) => (
            <div className="field-box animate-on-scroll" key={index}>
              <h4>{field.title}</h4>
              <p>{field.text}</p>
            </div>
          ))}
        </div>

        <div className="fields-right-panel dark-panel">
          <h2>Fields in DEV-CaMP</h2>
          <p>
            There are a total of 13 fields in DEV-CaMP, with each field including up to 17 subfields.
            This section highlights 12 major fields and their descriptions in brief.
          </p>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    </>
  );
};

export default UserGuidePage;
