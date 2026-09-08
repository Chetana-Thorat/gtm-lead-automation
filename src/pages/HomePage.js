import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './HomePage.css';
import { HashLink } from 'react-router-hash-link';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const glossary = [
  {
    term: "Project Description",
    definition: "A critical mineral used in electric vehicle batteries and energy storage systems."
  },
  {
    term: "Location Information",
    definition: "Describes the development phase: Exploration, Development, Active, etc."
  },
  {
    term: "Developer Description",
    definition: "Indicates whether the mineral project is on public, private, or mixed land."
  },
  {
    term: "Development Plans",
    definition: "The initial stage of a mining project, involving surveys and assessments."
  },
  {
    term: "Financial Support",
    definition: "Minerals essential to the economy and national security, with vulnerable supply chains."
  },
  {
    term: "Land Ownership",
    definition: "A group of 17 chemically similar elements used in high-tech devices, defense, and clean energy."
  },
  {
    term: "Litigation Information",
    definition: "A group of 17 chemically similar elements used in high-tech devices, defense, and clean energy."
  }
];

const teamMembers = [
  {
    name: "John D. Graham",
    role: "Principal Investigator, Professor",
    image: "/images/john.jpg",
    link: "https://oneill.indiana.edu/faculty-research/directory/profiles/faculty/full-time/graham-john.html"
  },
  {
    name: "John A. Rupp ",
    role: "Professor",
    image: "/images/rupp.jpg",
    link: "https://oneill.indiana.edu/faculty-research/directory/profiles/faculty/full-time/rupp-john.html"
  },
  {
    name: "Kelly Anderson",
    role: "Research Assistant",
    image: "/images/kelly.jpg",
    link: "https://www.linkedin.com/in/kellylynnanderson/"
  },
  {
    name: "Shannon Halinski",
    role: "Research Assistant",
    image: "/images/shannon.jpg",
    link: "https://www.linkedin.com/in/shannon-halinski/"
  },
  {
    name: "Chetana Thorat",
    role: "Research Assistant",
    image: "/images/Chetana02.jpeg",
    link: "https://www.linkedin.com/in/chetana-thorat/"
  },
  {
    name: "David Young",
    role: "Research Assistant",
    image: "/images/david.jpg",
    link: "https://www.linkedin.com/in/david-young-ii-863355311/"
  },
  {
    name: "Jax Fisher",
    role: "Research Assistant",
    image: "/images/Jax.jpg",
    link: "https://www.linkedin.com/in/jax-fisher/"
  }
];

function HomePage() {
  const navigate = useNavigate();

  // Controls the dataset-request modal.
  const [showDatasetForm, setShowDatasetForm] = useState(false);

  // Stores the visitor's form values until the submission is completed.
  const [datasetForm, setDatasetForm] = useState({
    name: '',
    email: '',
    organization: ''
  });

  // Shows the successful submission state.
  const [datasetSubmitted, setDatasetSubmitted] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Opens the dataset request form.
  const handleDatasetClick = (e) => {
    e.preventDefault();

    setDatasetSubmitted(false);
    setShowDatasetForm(true);
  };

  // Updates the dataset form as the visitor types.
  const handleDatasetInputChange = (e) => {
    const { name, value } = e.target;

    setDatasetForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Starts the dataset download after the visitor submits the form.
  // Sends the lead to n8n first, then starts the dataset download.
const handleDatasetSubmit = async (e) => {
  e.preventDefault();

  const name = datasetForm.name.trim();
  const email = datasetForm.email.trim();
  const organization = datasetForm.organization.trim();

  if (!name || !email) {
    return;
  }

  // This contains the actual lead information.
  const leadData = {
    name: name,
    email: email,
    organization: organization,
    source: 'website',
    conversion: 'dataset_download',
    resource_name: 'DEV-CaMP Dataset'
  };

  try {
    // Send the actual lead to our n8n workflow.
    const response = await fetch(
      'https://chthorat.app.n8n.cloud/webhook/devcamp-dataset-lead',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      }
    );

    if (!response.ok) {
      throw new Error('Unable to save lead information.');
    }

    // Send only non-PII analytics information to GTM / GA4.
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: 'dataset_request_submit',
      resource_name: 'DEV-CaMP Dataset',
      source: 'website',
      organization_provided: Boolean(organization)
    });

    // Download the dataset only after n8n accepts the request.
    const downloadLink = document.createElement('a');

    downloadLink.href = '/DevCamp_new.xlsx';
    downloadLink.download = 'DEV-CaMP-Dataset.xlsx';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setDatasetSubmitted(true);

  } catch (error) {
    console.error('Dataset request failed:', error);

    alert(
      'We could not process your dataset request. Please try again.'
    );
  }
};

  // Closes the dataset form and resets its state.
  const closeDatasetForm = () => {
    setShowDatasetForm(false);
    setDatasetSubmitted(false);

    setDatasetForm({
      name: '',
      email: '',
      organization: ''
    });
  };

  return (
    <div className="homepage">

      <header className="hero" data-aos="fade-down">
        <div className="hero-content">
          <h1>Database of EV Critical Material Projects</h1>

          <p>Unlock Critical Material Insights Across the U.S.</p>

          <div className="hero-buttons">
            <button onClick={() => navigate('/map')}>
              Explore Interactive Map
            </button>

            <button onClick={() => navigate('/projects')}>
              Search Projects
            </button>
          </div>
        </div>
      </header>


      <section
        className="map-preview-horizontal"
        data-aos="fade-right"
      >
        <div className="map-preview-container">

          <div className="map-preview-text">
            <h2>Mini Map Preview</h2>

            <p>
              Discover and interact with a visual snapshot of critical materials projects
              across the U.S. Click below to explore the full interactive map with over 100+ projects.
            </p>

            <button
              className="map-button"
              onClick={() => navigate('/map')}
            >
              Explore Full Map
            </button>
          </div>

          <div className="map-preview-map">
            <arcgis-embedded-map
              style={{
                height: '100%',
                width: '100%',
                borderRadius: '20px',
                overflow: 'hidden'
              }}
              item-id="a2f5f33bf0fe4d73b54ea3cc8fbd762b"
              portal-url="https://iu.maps.arcgis.com"
              theme="light"
            ></arcgis-embedded-map>
          </div>

        </div>
      </section>


      {/* About Section */}
      <section
        className="about-section"
        id="about"
      >
        <h2 className="about-title">
          About DEV-CaMP
        </h2>

        <div className="about-grid">

          <div className="about-card">
            <h3>What Is DEV-CaMP?</h3>

            <p>
              The <strong>Database of EV Critical Material Projects (DEV-CaMP)</strong> is a growing resource that tracks U.S. mining and associated processing projects for key materials used in electric vehicles, including lithium, copper, cobalt, neodymium, nickel, graphite, and manganese.
            </p>
          </div>

          <div className="about-card">
            <h3>Who Built It?</h3>

            <p>
              Our team — a working group established in <strong>2021</strong> at <strong>Indiana University’s Paul H. O’Neill School of Public and Environmental Affairs</strong> — brings together faculty, graduate students, and undergraduate researchers with an interest in the policy, permitting, funding, and development challenges facing the U.S. critical materials sector.
            </p>
          </div>

          <div className="about-card">
            <h3>Current Data & Updates</h3>

            <p>
              This release marks the <strong>first time the database has been made publicly available</strong>. The information reflects data collected through <strong>January 2025</strong>, and we plan to update the site on an annual basis as new projects emerge and existing sites progress.
            </p>
          </div>

          <div className="about-card">
            <h3>What’s Next?</h3>

            <p>
              Additional data fields will be added over time as new information is collected and fully reviewed. For questions or suggestions, please contact our principal investigator, John D. Graham, at <a href="mailto:grahamjd@iu.edu">grahamjd@iu.edu</a>.
            </p>
          </div>

        </div>

        <div className="about-dataset-btn-wrapper">
          <a
            href="/DevCamp_new.xlsx"
            download="DEV-CaMP-Dataset.xlsx"
            className="about-dataset-btn"
            onClick={handleDatasetClick}
          >
            Download Dataset →
          </a>
        </div>

      </section>


      {/* Team Section */}
      <section
        className="about-people-section"
        id="team"
      >
        <h2 className="about-people-title">
          Meet the Team
        </h2>

        <div className="people-row">
          {teamMembers.slice(0, 4).map((person, index) => (
            <div
              key={index}
              className="person-card"
            >
              <div className="person-photo-container">

                <img
                  src={person.image}
                  alt={person.name}
                  className="person-photo"
                />

                <a
                  href={person.link}
                  target="_blank"
                  rel="noreferrer"
                  className="person-arrow-wrapper"
                >
                  <span className="arrow-icon">
                    ↗
                  </span>

                  <div className="arrow-tooltip">
                    Click to view profile
                  </div>
                </a>

              </div>

              <h3>
                {person.name}
              </h3>

              <p>
                {person.role}
              </p>
            </div>
          ))}
        </div>

        <div className="people-row center-row">
          {teamMembers.slice(4).map((person, index) => (
            <div
              key={index + 4}
              className="person-card"
            >
              <div className="person-photo-container">

                <img
                  src={person.image}
                  alt={person.name}
                  className="person-photo"
                />

                <a
                  href={person.link}
                  target="_blank"
                  rel="noreferrer"
                  className="person-arrow-wrapper"
                >
                  <span className="arrow-icon">
                    ↗
                  </span>

                  <div className="arrow-tooltip">
                    Click to view profile
                  </div>
                </a>

              </div>

              <h3>
                {person.name}
              </h3>

              <p>
                {person.role}
              </p>
            </div>
          ))}
        </div>

      </section>


      {/* Glossary Section */}
      <section
        id="glossary"
        className="glossary-section"
        data-aos="fade-up"
      >
        <h2>
          User Guidance: Fields in DEV-CaMP
        </h2>

        <div className="glossary-grid custom-layout">

          <div className="glossary-card">
            <h4>Project Description</h4>
            <p>Basic information about the project.</p>
          </div>

          <div className="glossary-card">
            <h4>Location Information</h4>
            <p>
              Includes state, county, and distance to nearest population center.
            </p>
          </div>

          <div className="glossary-card">
            <h4>Developer Description</h4>
            <p>
              Developer information including lead developer and commercial partnerships.
            </p>
          </div>

          <div className="glossary-card">
            <h4>Development Plans</h4>
            <p>
              Includes information regarding plans for processing and the level of production.
            </p>
          </div>

          <div className="glossary-card">
            <h4>Financial Support</h4>
            <p>
              Supply agreements and federal or state grants/loans.
            </p>
          </div>

          <div className="glossary-card">
            <h4>Land Ownership</h4>
            <p>
              Public and private land information.
            </p>
          </div>

          <div className="glossary-card empty"></div>

          <div className="glossary-card">
            <h4>Litigation Information</h4>
            <p>
              Includes information about lawsuits the project may be facing.
            </p>
          </div>

          <div className="glossary-card empty"></div>

        </div>

        <div className="glossary-button-wrapper">
          <HashLink
            smooth
            to="/user-guide#user-guide-top"
            className="glossary-btn"
          >
            View Full User Guide →
          </HashLink>
        </div>

      </section>


      {/* Footer / Contact Section */}
      <footer
        id="contact"
        className="site-footer"
        data-aos="fade-up"
      >
        <div className="footer-grid compact">

          <div className="footer-section brand">
            <h3>DEV-CaMP</h3>
            <p>Indiana University Bloomington</p>
          </div>

          <div className="footer-section links">
            <h4>Quick Links</h4>

            <ul>
              <li>
                <a href="/">
                  Home
                </a>
              </li>

              <li>
                <a href="/map">
                  Map
                </a>
              </li>

              <li>
                <a href="/projects">
                  Projects
                </a>
              </li>

              <li>
                <a href="/user-guide">
                  User Guide
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h4>Contact</h4>

            <ul>
              <li>
                Prof. John D. Graham — grahamjd@iu.edu
              </li>

              <li>
                <a
                  href="https://oneill.indiana.edu/faculty-research/directory/profiles/faculty/full-time/graham-john.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  John D. Graham Profile
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © 2025 Indiana University Bloomington
          </p>

          <p>
            Supported by the DEV-CaMP Research Group
          </p>
        </div>

        <a
          href="#top"
          className="back-to-top"
        >
          ↑ Back to Top
        </a>

      </footer>


      {/* Dataset request modal */}
      {showDatasetForm && (
        <div
          className="dataset-modal-overlay"
          onClick={closeDatasetForm}
        >
          <div
            className="dataset-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="dataset-modal-close"
              onClick={closeDatasetForm}
              aria-label="Close"
            >
              ×
            </button>

            {!datasetSubmitted ? (
              <>
                <h2>
                  Download the DEV-CaMP Dataset
                </h2>

                <p className="dataset-modal-description">
                  Enter your details to download the current DEV-CaMP dataset.
                </p>

                <form
                  className="dataset-request-form"
                  onSubmit={handleDatasetSubmit}
                >

                  <div className="dataset-form-group">
                    <label htmlFor="dataset-name">
                      Name
                    </label>

                    <input
                      id="dataset-name"
                      name="name"
                      type="text"
                      value={datasetForm.name}
                      onChange={handleDatasetInputChange}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="dataset-form-group">
                    <label htmlFor="dataset-email">
                      Work / University Email
                    </label>

                    <input
                      id="dataset-email"
                      name="email"
                      type="email"
                      value={datasetForm.email}
                      onChange={handleDatasetInputChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="dataset-form-group">
                    <label htmlFor="dataset-organization">
                      Organization
                      <span className="optional-label">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="dataset-organization"
                      name="organization"
                      type="text"
                      value={datasetForm.organization}
                      onChange={handleDatasetInputChange}
                      autoComplete="organization"
                    />
                  </div>

                  <button
                    type="submit"
                    className="dataset-form-submit"
                  >
                    Submit & Download Dataset
                  </button>

                </form>
              </>
            ) : (
              <div className="dataset-success">

                <h2>
                  Thank you!
                </h2>

                <p>
                  Your dataset download has started.
                </p>

                <button
                  type="button"
                  className="dataset-form-submit"
                  onClick={closeDatasetForm}
                >
                  Done
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default HomePage;