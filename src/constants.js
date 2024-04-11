const summaryDataDefaults = {
  'Field name': {
    value: 'not set',
    desc: `Name of the field 
          (e.g., “North Field”)`,
  },
  Species: {
    value: ['not set'],
    desc: `list of species in
           the cover crop mix`,
  },
  'Termination Date': {
    value: 'not set',
    desc: `Date when the 
          cover crop was terminated`,
  },
  'Dry Biomass': {
    value: 'not set',
    desc: `The amount of cover crop biomass
           on a dry weight basis`,
  },
  'Residue N Content': {
    value: 'not set',
    desc: `residue Nitrogen content 
            on a dry weight basis`,
  },
  Carbohydrates: {
    value: 'not set',
    desc: `Non-structural labile carbohydrate concentration 
          based on lab results. This represents the most readily
          decomposable C constituents in plant materials.
          The default value is based on the nitrogen concentration.
          If you have the raw data from near infra-red reflectance 
          spectroscopy (NIRS) analysis, use the following equation:
          carbohydrates 
          (%) = % crude protein (CP) + % fat + % non-fibrous carbohydrates (NFC)`,
  },
  'Holo-cellulose': {
    value: 'not set',
    desc: `Structural holo-cellulose (i.e., both cellulose and hemi-cellulose) 
          concentration based on lab results. This represents the moderately 
          decomposable C constituents in plant materials. The default value 
          is based on the nitrogen concentration. If you have the raw data 
          from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:
          holo-cellulose (%) = % neutral detergent fiber (NDF) – (% lignin + % ash)`,
  },
  Lignin: {
    value: 'not set',
    desc: `Structural lignin concentration based on lab results. 
          This represents the most recalcitrant C constituents in 
          plant materials. The default value is based on the 
          nitrogen concentration.`,
  },
};

const sidebarListData = [
  {
    label: 'Summary',
    key: 'sidebar-nav-1',
    startPos: 0,
    endPos: 100,
  },
  {
    label: 'Nitrogen Released',
    key: 'sidebar-nav-2',
    startPos: 100,
    endPos: 200,
  },
  {
    label: 'Residue Remaining',
    key: 'sidebar-nav-3',
    startPos: 200,
    endPos: 300,
  },
  {
    label: 'Biomass Map',
    key: 'sidebar-nav-4',
    startPos: 300,
    endPos: 400,
  },
  {
    label: 'Nitrogen Map',
    key: 'sidebar-nav-5',
    startPos: 400,
    endPos: 500,
  },
];

const sidebarListDataSatpath = [
  {
    label: 'Data Summary',
    key: 'sidebar-nav-1',
    startPos: 0,
    endPos: 100,
  },
  {
    label: 'Location',
    key: 'sidebar-nav-2',
    startPos: 100,
    endPos: 200,
  },
  {
    label: 'Soil Data',
    key: 'sidebar-nav-3',
    startPos: 200,
    endPos: 300,
  },
  {
    label: 'Cover Crop 1',
    key: 'sidebar-nav-4',
    startPos: 300,
    endPos: 400,
  },
  {
    label: 'Cover Crop 2',
    key: 'sidebar-nav-5',
    startPos: 400,
    endPos: 500,
  },
  {
    label: 'Cash Crop',
    key: 'sidebar-nav-6',
    startPos: 500,
    endPos: 600,
  },
  {
    label: 'Nitrogen Released',
    key: 'sidebar-nav-7',
    startPos: 600,
    endPos: 700,
  },
  {
    label: 'Residue Remaining',
    key: 'sidebar-nav-8',
    startPos: 700,
    endPos: 800,
  },
  {
    label: 'Nitrogen Map',
    key: 'sidebar-nav-9',
    startPos: 800,
    endPos: 900,
  },
  // {
  //   label: 'Biomass Map',
  //   key: 'sidebar-nav-9',
  //   startPos: 700,
  //   endPos: 800,
  // },
];

export { summaryDataDefaults, sidebarListData, sidebarListDataSatpath };
