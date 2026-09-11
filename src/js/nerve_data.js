export const NERVE_CATEGORIES = [
  { id: 'brain', label: 'ncat_brain' },
  { id: 'spinal_cord', label: 'ncat_spinal_cord' },
  { id: 'cranial_nerves', label: 'ncat_cranial_nerves' },
  { id: 'peripheral_nerves', label: 'ncat_peripheral_nerves' }
];

export const NERVE_DB = [
  {
    id: "nerve_brain",
    name: "n_brain",
    latinName: "Encephalon",
    category: "brain",
    description: "desc_brain",
    function: "func_brain",
    clinicalNotes: "clin_brain",
    relatedStructures: ["nerve_spinal_cord", "nerve_optic", "nerve_vagus"]
  },
  {
    id: "nerve_spinal_cord",
    name: "n_spinal_cord",
    latinName: "Medulla spinalis",
    category: "spinal_cord",
    description: "desc_spinal_cord",
    function: "func_spinal_cord",
    clinicalNotes: "clin_spinal_cord",
    relatedStructures: ["nerve_brain", "nerve_sciatic"]
  },
  {
    id: "nerve_optic",
    name: "n_optic",
    latinName: "Nervus opticus",
    category: "cranial_nerves",
    description: "desc_optic",
    function: "func_optic",
    clinicalNotes: "clin_optic",
    relatedStructures: ["nerve_brain"]
  },
  {
    id: "nerve_vagus",
    name: "n_vagus",
    latinName: "Nervus vagus",
    category: "cranial_nerves",
    description: "desc_vagus",
    function: "func_vagus",
    clinicalNotes: "clin_vagus",
    relatedStructures: ["nerve_brain"]
  },
  {
    id: "nerve_sciatic",
    name: "n_sciatic",
    latinName: "Nervus ischiadicus",
    category: "peripheral_nerves",
    description: "desc_sciatic",
    function: "func_sciatic",
    clinicalNotes: "clin_sciatic",
    relatedStructures: ["nerve_spinal_cord"]
  }
];
