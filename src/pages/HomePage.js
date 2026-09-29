import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AOS from 'aos';
import 'aos/dist/aos.css';

import './HomePage.css';

import { HashLink } from 'react-router-hash-link';

import 'leaflet/dist/leaflet.css';


// ============================================================
// Glossary data
// ============================================================

const glossary = [
  {
    term: "Project Description",
    definition:
      "A critical mineral used in electric vehicle batteries and energy storage systems."
  },
  {
    term: "Location Information",
    definition:
      "Describes the development phase: Exploration, Development, Active, etc."
  },
  {
    term: "Developer Description",
    definition:
      "Indicates whether the mineral project is on public, private, or mixed land."
  },
  {
    term: "Development Plans",
    definition:
      "The initial stage of a mining project, involving surveys and assessments."
  },
  {
    term: "Financial Support",
    definition:
      "Minerals essential to the economy and national security, with vulnerable supply chains."
  },
  {
    term: "Land Ownership",
    definition:
      "A group of 17 chemically similar elements used in high-tech devices, defense, and clean energy."
  },
  {
    term: "Litigation Information",
    definition:
      "A group of 17 chemically similar elements used in high-tech devices, defense, and clean energy."
  }
];


// ============================================================
// Team data
// ============================================================

const teamMembers = [
  {
    name: "John D. Graham",
    role: "Principal Investigator, Professor",
    image: "/images/john.jpg",
    link:
      "https://oneill.indiana.edu/faculty-research/directory/profiles/faculty/full-time/graham-john.html"
  },
  {
    name: "John A. Rupp ",
    role: "Professor",
    image: "/images/rupp.jpg",
    link:
      "https://oneill.indiana.edu/faculty-research/directory/profiles/faculty/full-time/rupp-john.html"
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


// ============================================================
// Home Page
// ============================================================

function HomePage() {

  const navigate = useNavigate();


  // ==========================================================
  // Prospective student form state
  // ==========================================================

  const [showDatasetForm, setShowDatasetForm] = useState(false);

  const [datasetForm, setDatasetForm] = useState({
    name: '',
    email: '',
    intendedMajor: ''
  });

  const [datasetSubmitted, setDatasetSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);


  // ==========================================================
  // Initialize page animations
  // ==========================================================

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);


  // ==========================================================
  // Open the form
  // ==========================================================

  const handleDatasetClick = (e) => {
    e.preventDefault();

    setDatasetSubmitted(false);
    setShowDatasetForm(true);
  };


  // ==========================================================
  // Update form values
  // ==========================================================

  const handleDatasetInputChange = (e) => {

    const { name, value } = e.target;

    setDatasetForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  // ==========================================================
  // Submit prospective student lead to n8n
  // ==========================================================

  const handleDatasetSubmit = async (e) => {

    e.preventDefault();

    // Normalize basic user input.
    const name = datasetForm.name.trim();
    const email = datasetForm.email.trim().toLowerCase();
    const intendedMajor = datasetForm.intendedMajor.trim();


    // Basic client-side validation.
    if (!name || !email || !intendedMajor) {
      return;
    }


    // This is the lead event that n8n will receive.
    const inquiryEvent = {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      
      name: name,
      email: email,
      intendedMajor: intendedMajor,

      source: 'website',

      eventType: 'prospective_student_form_submitted'
    };


    try {

      setIsSubmitting(true);


      // ======================================================
      // IMPORTANT:
      //
      // Replace YOUR_N8N_TEST_WEBHOOK_URL with the Test URL
      // generated by the n8n Webhook node.
      //
      // Example:
      //
      // https://your-instance.app.n8n.cloud/
      // webhook-test/prospective-student-inquiry
      // ======================================================

      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/inquiries',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(inquiryEvent)
        }
      );


      // If n8n does not return a successful HTTP status,
      // treat the submission as failed.
      if (!response.ok) {
        throw new Error(
          `Unable to submit inquiry. Status: ${response.status}`
        );
      }


      // ======================================================
      // Optional analytics event
      //
      // Do NOT send name/email into GA4/GTM.
      // ======================================================

      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: 'prospective_student_form_submitted',
        source: 'website',
        intended_major_provided: Boolean(intendedMajor)
      });


      // Show the success message.
      setDatasetSubmitted(true);


      // Clear the form after successful submission.
      setDatasetForm({
        name: '',
        email: '',
        intendedMajor: ''
      });

    } catch (error) {

      console.error(
        'Prospective student inquiry submission failed:',
        error
      );

      alert(
        'We could not submit your information. Please try again.'
      );

    } finally {

      setIsSubmitting(false);

    }
  };


  // ==========================================================
  // Close and reset the form
  // ==========================================================

  const closeDatasetForm = () => {

    setShowDatasetForm(false);

    setDatasetSubmitted(false);

    setIsSubmitting(false);

    setDatasetForm({
      name: '',
      email: '',
      intendedMajor: ''
    });
  };


  // ==========================================================
  // Page
  // ==========================================================

  return (

    <div className="homepage">


      {/* ======================================================
          HERO SECTION
      ====================================================== */}

      <header className="hero" data-aos="fade-down">

        <div className="hero-content">

          <h1>
            Database of EV Critical Material Projects
          </h1>

          <p>
            Unlock Critical Material Insights Across the U.S.
          </p>

          <div className="hero-buttons">

            <button
              onClick={() => navigate('/map')}
            >
              Explore Interactive Map
            </button>

            <button
              onClick={() => navigate('/projects')}
            >
              Search Projects
            </button>

          </div>

        </div>

      </header>



      {/* ======================================================
          MAP PREVIEW
      ====================================================== */}

      <section
        className="map-preview-horizontal"
        data-aos="fade-right"
      >

        <div className="map-preview-container">


          <div className="map-preview-text">

            <h2>
              Mini Map Preview
            </h2>

            <p>
              Discover and interact with a visual snapshot of
              critical materials projects across the U.S.
              Click below to explore the full interactive map
              with over 100+ projects.
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

            >
            </arcgis-embedded-map>

          </div>

        </div>

      </section>



      {/* ======================================================
          ABOUT SECTION
      ====================================================== */}

      <section
        className="about-section"
        id="about"
      >

        <h2 className="about-title">
          About DEV-CaMP
        </h2>


        <div className="about-grid">


          <div className="about-card">

            <h3>
              What Is DEV-CaMP?
            </h3>

            <p>

              The{' '}

              <strong>
                Database of EV Critical Material Projects
                (DEV-CaMP)
              </strong>

              {' '}is a growing resource that tracks U.S.
              mining and associated processing projects for
              key materials used in electric vehicles,
              including lithium, copper, cobalt, neodymium,
              nickel, graphite, and manganese.

            </p>

          </div>


          <div className="about-card">

            <h3>
              Who Built It?
            </h3>

            <p>

              Our team — a working group established in{' '}

              <strong>
                2021
              </strong>

              {' '}at{' '}

              <strong>
                Indiana University’s Paul H. O’Neill School
                of Public and Environmental Affairs
              </strong>

              {' '}— brings together faculty, graduate
              students, and undergraduate researchers with
              an interest in the policy, permitting, funding,
              and development challenges facing the U.S.
              critical materials sector.

            </p>

          </div>


          <div className="about-card">

            <h3>
              Current Data & Updates
            </h3>

            <p>

              This release marks the{' '}

              <strong>
                first time the database has been made publicly
                available
              </strong>.

              {' '}The information reflects data collected
              through{' '}

              <strong>
                January 2025
              </strong>,

              {' '}and we plan to update the site on an annual
              basis as new projects emerge and existing sites
              progress.

            </p>

          </div>


          <div className="about-card">

            <h3>
              What’s Next?
            </h3>

            <p>

              Additional data fields will be added over time
              as new information is collected and fully
              reviewed.

              For questions or suggestions, please contact
              our principal investigator, John D. Graham, at{' '}

              <a href="mailto:grahamjd@iu.edu">
                grahamjd@iu.edu
              </a>.

            </p>

          </div>

        </div>


        {/* ====================================================
            BUTTON THAT OPENS THE PROSPECTIVE STUDENT FORM
        ==================================================== */}

        <div className="about-dataset-btn-wrapper">

          <a
            href="/DevCamp_new.xlsx"
            className="about-dataset-btn"
            onClick={handleDatasetClick}
          >
            Request More Information →
          </a>

        </div>

      </section>



      {/* ======================================================
          TEAM SECTION
      ====================================================== */}

      <section
        className="about-people-section"
        id="team"
      >

        <h2 className="about-people-title">
          Meet the Team
        </h2>


        <div className="people-row">

          {teamMembers.slice(0, 4).map(
            (person, index) => (

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

            )
          )}

        </div>


        <div className="people-row center-row">

          {teamMembers.slice(4).map(
            (person, index) => (

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

            )
          )}

        </div>

      </section>



      {/* ======================================================
          GLOSSARY SECTION
      ====================================================== */}

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

            <h4>
              Project Description
            </h4>

            <p>
              Basic information about the project.
            </p>

          </div>


          <div className="glossary-card">

            <h4>
              Location Information
            </h4>

            <p>
              Includes state, county, and distance to nearest
              population center.
            </p>

          </div>


          <div className="glossary-card">

            <h4>
              Developer Description
            </h4>

            <p>
              Developer information including lead developer
              and commercial partnerships.
            </p>

          </div>


          <div className="glossary-card">

            <h4>
              Development Plans
            </h4>

            <p>
              Includes information regarding plans for
              processing and the level of production.
            </p>

          </div>


          <div className="glossary-card">

            <h4>
              Financial Support
            </h4>

            <p>
              Supply agreements and federal or state
              grants/loans.
            </p>

          </div>


          <div className="glossary-card">

            <h4>
              Land Ownership
            </h4>

            <p>
              Public and private land information.
            </p>

          </div>


          <div className="glossary-card empty">
          </div>


          <div className="glossary-card">

            <h4>
              Litigation Information
            </h4>

            <p>
              Includes information about lawsuits the project
              may be facing.
            </p>

          </div>


          <div className="glossary-card empty">
          </div>


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



      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer
        id="contact"
        className="site-footer"
        data-aos="fade-up"
      >

        <div className="footer-grid compact">


          <div className="footer-section brand">

            <h3>
              DEV-CaMP
            </h3>

            <p>
              Indiana University Bloomington
            </p>

          </div>


          <div className="footer-section links">

            <h4>
              Quick Links
            </h4>

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

            <h4>
              Contact
            </h4>

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



      {/* ======================================================
          PROSPECTIVE STUDENT FORM MODAL
      ====================================================== */}

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
                  Request More Information
                </h2>


                <p className="dataset-modal-description">
                  Tell us who you are and what you are
                  interested in studying.
                </p>


                <form
                  className="dataset-request-form"
                  onSubmit={handleDatasetSubmit}
                >


                  {/* NAME */}

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
                      placeholder="Your full name"
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="dataset-form-group">

                    <label htmlFor="dataset-email">
                      Email
                    </label>

                    <input
                      id="dataset-email"
                      name="email"
                      type="email"
                      value={datasetForm.email}
                      onChange={handleDatasetInputChange}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                    />

                  </div>


                  {/* INTENDED MAJOR */}

                  <div className="dataset-form-group">

                    <label htmlFor="dataset-intended-major">
                      Intended Major / Academic Interest
                    </label>

                    <input
                      id="dataset-intended-major"
                      name="intendedMajor"
                      type="text"
                      value={datasetForm.intendedMajor}
                      onChange={handleDatasetInputChange}
                      required
                      placeholder="e.g. Data Science"
                    />

                  </div>


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    className="dataset-form-submit"
                    disabled={isSubmitting}
                  >

                    {isSubmitting
                      ? 'Submitting...'
                      : 'Submit'}

                  </button>


                </form>

              </>

            ) : (

              <div className="dataset-success">

                <h2>
                  Thank you!
                </h2>

                <p>
                  We received your information successfully.
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