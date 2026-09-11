export const CARDIO_CATEGORIES = [
  { id: 'heart', label: 'ccat_heart' },
  { id: 'arteries', label: 'ccat_arteries' },
  { id: 'veins', label: 'ccat_veins' }
];

export const CARDIO_DB = [
  {
    id: "cardio_heart",
    name: "c_heart",
    latinName: "Cor",
    category: "heart",
    description: "cdesc_heart",
    function: "cfunc_heart",
    clinicalNotes: "cclin_heart",
    relatedStructures: ["cardio_aorta", "cardio_vena_cava"]
  },
  {
    id: "cardio_aorta",
    name: "c_aorta",
    latinName: "Aorta",
    category: "arteries",
    description: "cdesc_aorta",
    function: "cfunc_aorta",
    clinicalNotes: "cclin_aorta",
    relatedStructures: ["cardio_heart"]
  },
  {
    id: "cardio_vena_cava",
    name: "c_vena_cava",
    latinName: "Vena cava",
    category: "veins",
    description: "cdesc_vena_cava",
    function: "cfunc_vena_cava",
    clinicalNotes: "cclin_vena_cava",
    relatedStructures: ["cardio_heart"]
  },
  {
    id: "cardio_pulmonary_artery",
    name: "c_pulmonary_artery",
    latinName: "Arteria pulmonalis",
    category: "arteries",
    description: "cdesc_pulmonary_artery",
    function: "cfunc_pulmonary_artery",
    clinicalNotes: "cclin_pulmonary_artery",
    relatedStructures: ["cardio_heart"]
  },
  {
    id: "cardio_pulmonary_vein",
    name: "c_pulmonary_vein",
    latinName: "Vena pulmonalis",
    category: "veins",
    description: "cdesc_pulmonary_vein",
    function: "cfunc_pulmonary_vein",
    clinicalNotes: "cclin_pulmonary_vein",
    relatedStructures: ["cardio_heart"]
  },
  {
    id: "cardio_carotid_artery",
    name: "c_carotid_artery",
    latinName: "Arteria carotis communis",
    category: "arteries",
    description: "cdesc_carotid",
    function: "cfunc_carotid",
    clinicalNotes: "cclin_carotid",
    relatedStructures: ["cardio_aorta"]
  },
  {
    id: "cardio_jugular_vein",
    name: "c_jugular_vein",
    latinName: "Vena jugularis",
    category: "veins",
    description: "cdesc_jugular",
    function: "cfunc_jugular",
    clinicalNotes: "cclin_jugular",
    relatedStructures: ["cardio_vena_cava"]
  }
];
