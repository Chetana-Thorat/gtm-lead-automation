import React from "react";
import "./PublicationsPage.css";

const publications = [
  {
    title: "Presidential agendas without success: United States critical minerals and materials policy to support the electric vehicle transition",
    authors: "Khoi Hua, Eva Brungard, Kelly Lynn Anderson, Shannon Halinski, John A. Rupp, John D. Graham",
    journal: "Energy Research & Social Science",
    date: "February 8, 2025",
    link: "https://www.sciencedirect.com/science/article/abs/pii/S2214629625000453"
  },
  {
    title: "Hoping to mine: The nascent critical materials industry in the United States",
    authors: "Kelly Lynn Anderson, Shannon Halinski, Khoi Hua, John A. Rupp, John D. Graham",
    journal: "Resources Policy",
    date: "March 11, 2025",
    link: "https://www.sciencedirect.com/science/article/abs/pii/S0301420725000704"
  },
  {
    title: "The Global Rise of the Modern Plug-In Electric Vehicle: Innovation, Strategy and Public Policy",
    authors: "John D. Graham",
    journal: "Elgar Publishing, London, UK",
    date: "2021",
    link: "https://www.e-elgar.com/shop/usd/the-global-rise-of-the-modern-plug-in-electric-vehicle-9781800880122.html"
  },
  {
    title: "Lithium in the Green Energy Transition: The Quest for both Sustainability and Security",
    authors: "John D. Graham, John A. Rupp, Eva Brungard",
    journal: "Sustainability, 13(20)",
    date: "2021",
    link: "https://doi.org/10.3390/su132011274"
  },
  {
    title: "Latin America’s Lithium: Critical Minerals and the Global Energy Transition",
    authors: "Ana Elizabeth Bastida, John D. Graham, John A. Rupp, Henry Sanderson, Patricia I. Vasquez",
    journal: "Latin American Program, The Wilson Center",
    date: "2023",
    link: "https://www.wilsoncenter.org/event/latin-americas-lithium-critical-minerals-and-global-energy-transition"
  },
  {
    title: "The Backseat Drivers of the EV Industry: Community Cooperation and Opposition to Domestic Lithium Mining",
    authors: "Shannon Halinski (O’Neill School Undergraduate Thesis)",
    journal: "IU CARI Blog",
    date: "December 19, 2024",
    link: "https://blogs.iu.edu/cari/2024/12/19/the-backseat-drivers-of-the-ev-industry-community-cooperation-and-opposition-to-domestic-lithium-mining/"
  }
];

const PublicationsPage = () => {
  return (
    <div className="publications-split-page">
      <div className="publications-left-panel">
        <h1>Publications</h1>
        <p className="publications-subtext">
          This page showcases key publications by the DEV-CaMP research team related to critical material, policy, and energy transition.
        </p>
      </div>
        
      <div className="publications-right-panel">
        <div className="publication-list">
          {publications.map((pub, index) => (
            <div key={index} className="publication-card">
              <h2>{pub.title}</h2>
              <p><strong>Authors:</strong> {pub.authors}</p>
              <p><strong>Journal:</strong> {pub.journal}</p>
              <p><strong>Published:</strong> {pub.date}</p>
              <a
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                className="read-link"
              >
                View Publication
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicationsPage;
