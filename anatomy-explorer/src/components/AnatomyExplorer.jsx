import { useState, useCallback } from 'react';
import Anatomogram, { anatomogramSpecies } from '@ebi-gene-expression-group/anatomogram';
import './AnatomyExplorer.css';

// Map of organ IDs to human-readable names for common organs
const ORGAN_NAMES = {
  // Human organs
  'UBERON_0000955': 'Brain',
  'UBERON_0000948': 'Heart',
  'UBERON_0002107': 'Liver',
  'UBERON_0002048': 'Lung',
  'UBERON_0002113': 'Kidney',
  'UBERON_0000945': 'Stomach',
  'UBERON_0001155': 'Colon',
  'UBERON_0002106': 'Spleen',
  'UBERON_0001264': 'Pancreas',
  'UBERON_0002371': 'Bone Marrow',
  'UBERON_0002110': 'Gallbladder',
  'UBERON_0001043': 'Esophagus',
  'UBERON_0000970': 'Eye',
  'UBERON_0001831': 'Ear',
  'UBERON_0001013': 'Skin',
  'UBERON_0001255': 'Bladder',
  'UBERON_0000310': 'Breast',
  'UBERON_0000992': 'Ovary',
  'UBERON_0000995': 'Uterus',
  'UBERON_0000989': 'Penis',
  'UBERON_0000473': 'Testis',
  'UBERON_0002369': 'Adrenal Gland',
  'UBERON_0002046': 'Thyroid',
  'UBERON_0002370': 'Thymus',
  'UBERON_0001736': 'Submandibular Gland',
  'UBERON_0002037': 'Cerebellum',
  'UBERON_0001870': 'Frontal Cortex',
  'UBERON_0001871': 'Temporal Lobe',
  'UBERON_0000956': 'Cerebral Cortex',
  'UBERON_0001894': 'Diencephalon',
  'UBERON_0001896': 'Midbrain',
  'UBERON_0001897': 'Medulla Oblongata',
  'UBERON_0001898': 'Hypothalamus',
  'UBERON_0002421': 'Hippocampus',
  'UBERON_0001876': 'Amygdala',
  'UBERON_0002372': 'Tonsil',
  'UBERON_0000029': 'Lymph Node',
  'UBERON_0002114': 'Small Intestine',
  'UBERON_0000947': 'Aorta',
  // Plant organs
  'PO_0009005': 'Root',
  'PO_0009046': 'Flower',
  'PO_0009001': 'Fruit',
  'PO_0025034': 'Leaf',
  'PO_0009049': 'Inflorescence',
  'PO_0009006': 'Shoot',
  'PO_0009030': 'Sepal',
  'PO_0009066': 'Anther',
  'PO_0009009': 'Embryo',
  'PO_0009089': 'Endosperm',
};

// Species views configuration
const SPECIES_VIEWS = {
  homo_sapiens: ['male', 'female', 'brain'],
  mus_musculus: ['male', 'female', 'brain'],
  brachypodium_distachyon: ['whole_plant', 'flower_parts'],
  hordeum_vulgare: ['whole_plant', 'flower_parts'],
  oryza_sativa: ['whole_plant', 'flower_parts'],
  solanum_lycopersicum: ['whole_plant', 'flower_parts'],
  sorghum_bicolor: ['whole_plant', 'flower_parts'],
  triticum_aestivum: ['whole_plant', 'flower_parts'],
  zea_mays: ['whole_plant', 'flower_parts'],
};

// Format species name for display
const formatSpeciesName = (species) => {
  return species
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format view name for display
const formatViewName = (view) => {
  return view
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function AnatomyExplorer() {
  const [species, setSpecies] = useState('homo_sapiens');
  const [view, setView] = useState('male');
  const [hoveredOrgan, setHoveredOrgan] = useState(null);
  const [selectedOrgans, setSelectedOrgans] = useState([]);
  const [highlightedOrgans, setHighlightedOrgans] = useState([]);

  // Get the full species identifier with view
  const getFullSpecies = useCallback(() => {
    const views = SPECIES_VIEWS[species];
    if (views && views.length > 0) {
      return `${species}.${view}`;
    }
    return species;
  }, [species, view]);

  // Handle species change
  const handleSpeciesChange = (e) => {
    const newSpecies = e.target.value;
    setSpecies(newSpecies);
    setSelectedOrgans([]);
    setHighlightedOrgans([]);
    setHoveredOrgan(null);

    // Set default view for species with multiple views
    const views = SPECIES_VIEWS[newSpecies];
    if (views && views.length > 0) {
      setView(views[0]);
    }
  };

  // Handle view change
  const handleViewChange = (e) => {
    setView(e.target.value);
    setSelectedOrgans([]);
    setHighlightedOrgans([]);
    setHoveredOrgan(null);
  };

  // Handle mouse over
  const handleMouseOver = useCallback((organId) => {
    setHoveredOrgan(organId);
    setHighlightedOrgans([organId]);
  }, []);

  // Handle mouse out
  const handleMouseOut = useCallback(() => {
    setHoveredOrgan(null);
    setHighlightedOrgans([]);
  }, []);

  // Handle click
  const handleClick = useCallback((organIds) => {
    const organId = Array.isArray(organIds) ? organIds[0] : organIds;
    setSelectedOrgans((prev) => {
      if (prev.includes(organId)) {
        return prev.filter((id) => id !== organId);
      }
      return [...prev, organId];
    });
  }, []);

  // Clear all selections
  const handleClearSelections = () => {
    setSelectedOrgans([]);
    setHighlightedOrgans([]);
    setHoveredOrgan(null);
  };

  // Get organ display name
  const getOrganName = (organId) => {
    return ORGAN_NAMES[organId] || organId;
  };

  // Get available views for current species
  const availableViews = SPECIES_VIEWS[species] || [];

  return (
    <div className="anatomy-explorer">
      <header className="explorer-header">
        <h1>Interactive Anatomy Explorer</h1>
        <p>Explore anatomical structures across different species</p>
      </header>

      <div className="explorer-controls">
        <div className="control-group">
          <label htmlFor="species-select">Species:</label>
          <select
            id="species-select"
            value={species}
            onChange={handleSpeciesChange}
          >
            {anatomogramSpecies.map((s) => (
              <option key={s} value={s}>
                {formatSpeciesName(s)}
              </option>
            ))}
          </select>
        </div>

        {availableViews.length > 0 && (
          <div className="control-group">
            <label htmlFor="view-select">View:</label>
            <select id="view-select" value={view} onChange={handleViewChange}>
              {availableViews.map((v) => (
                <option key={v} value={v}>
                  {formatViewName(v)}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="clear-button"
          onClick={handleClearSelections}
          disabled={selectedOrgans.length === 0}
        >
          Clear Selections
        </button>
      </div>

      <div className="explorer-content">
        <div className="anatomogram-container">
          <Anatomogram
            species={getFullSpecies()}
            showIds={selectedOrgans}
            highlightIds={highlightedOrgans}
            selectIds={selectedOrgans}
            showColour="#3498db"
            highlightColour="#e74c3c"
            selectColour="#9b59b6"
            showOpacity={0.5}
            highlightOpacity={0.6}
            selectOpacity={0.7}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={handleClick}
          />
        </div>

        <div className="info-panel">
          <div className="info-section">
            <h3>Current Selection</h3>
            {hoveredOrgan ? (
              <div className="hovered-info">
                <span className="label">Hovering:</span>
                <span className="value highlight">{getOrganName(hoveredOrgan)}</span>
                <span className="organ-id">({hoveredOrgan})</span>
              </div>
            ) : (
              <p className="hint">Hover over an organ to see its name</p>
            )}
          </div>

          <div className="info-section">
            <h3>Selected Organs ({selectedOrgans.length})</h3>
            {selectedOrgans.length > 0 ? (
              <ul className="selected-list">
                {selectedOrgans.map((organId) => (
                  <li key={organId} className="selected-item">
                    <span className="organ-name">{getOrganName(organId)}</span>
                    <button
                      className="remove-button"
                      onClick={() =>
                        setSelectedOrgans((prev) =>
                          prev.filter((id) => id !== organId)
                        )
                      }
                      title="Remove selection"
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">Click on organs to select them</p>
            )}
          </div>

          <div className="info-section legend">
            <h3>Legend</h3>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#e74c3c' }}></span>
              <span>Highlighted (hover)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#9b59b6' }}></span>
              <span>Selected (click)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#3498db' }}></span>
              <span>Shown</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="explorer-footer">
        <p>
          Powered by{' '}
          <a
            href="https://github.com/ebi-gene-expression-group/anatomogram"
            target="_blank"
            rel="noopener noreferrer"
          >
            @ebi-gene-expression-group/anatomogram
          </a>
        </p>
      </footer>
    </div>
  );
}

export default AnatomyExplorer;
