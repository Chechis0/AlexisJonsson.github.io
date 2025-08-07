const ELEMENTS = {
  "H": {
    "name": "Hydrogen",
    "number": 1,
    "atomic_mass": 1.008
  },
  "He": {
    "name": "Helium",
    "number": 2,
    "atomic_mass": 4.0026022
  },
  "Li": {
    "name": "Lithium",
    "number": 3,
    "atomic_mass": 6.94
  },
  "Be": {
    "name": "Beryllium",
    "number": 4,
    "atomic_mass": 9.01218315
  },
  "B": {
    "name": "Boron",
    "number": 5,
    "atomic_mass": 10.81
  },
  "C": {
    "name": "Carbon",
    "number": 6,
    "atomic_mass": 12.011
  },
  "N": {
    "name": "Nitrogen",
    "number": 7,
    "atomic_mass": 14.007
  },
  "O": {
    "name": "Oxygen",
    "number": 8,
    "atomic_mass": 15.999
  },
  "F": {
    "name": "Fluorine",
    "number": 9,
    "atomic_mass": 18.9984031636
  },
  "Ne": {
    "name": "Neon",
    "number": 10,
    "atomic_mass": 20.17976
  },
  "Na": {
    "name": "Sodium",
    "number": 11,
    "atomic_mass": 22.989769282
  },
  "Mg": {
    "name": "Magnesium",
    "number": 12,
    "atomic_mass": 24.305
  },
  "Al": {
    "name": "Aluminium",
    "number": 13,
    "atomic_mass": 26.98153857
  },
  "Si": {
    "name": "Silicon",
    "number": 14,
    "atomic_mass": 28.085
  },
  "P": {
    "name": "Phosphorus",
    "number": 15,
    "atomic_mass": 30.9737619985
  },
  "S": {
    "name": "Sulfur",
    "number": 16,
    "atomic_mass": 32.06
  },
  "Cl": {
    "name": "Chlorine",
    "number": 17,
    "atomic_mass": 35.45
  },
  "Ar": {
    "name": "Argon",
    "number": 18,
    "atomic_mass": 39.9481
  },
  "K": {
    "name": "Potassium",
    "number": 19,
    "atomic_mass": 39.09831
  },
  "Ca": {
    "name": "Calcium",
    "number": 20,
    "atomic_mass": 40.0784
  },
  "Sc": {
    "name": "Scandium",
    "number": 21,
    "atomic_mass": 44.9559085
  },
  "Ti": {
    "name": "Titanium",
    "number": 22,
    "atomic_mass": 47.8671
  },
  "V": {
    "name": "Vanadium",
    "number": 23,
    "atomic_mass": 50.94151
  },
  "Cr": {
    "name": "Chromium",
    "number": 24,
    "atomic_mass": 51.99616
  },
  "Mn": {
    "name": "Manganese",
    "number": 25,
    "atomic_mass": 54.9380443
  },
  "Fe": {
    "name": "Iron",
    "number": 26,
    "atomic_mass": 55.8452
  },
  "Co": {
    "name": "Cobalt",
    "number": 27,
    "atomic_mass": 58.9331944
  },
  "Ni": {
    "name": "Nickel",
    "number": 28,
    "atomic_mass": 58.69344
  },
  "Cu": {
    "name": "Copper",
    "number": 29,
    "atomic_mass": 63.5463
  },
  "Zn": {
    "name": "Zinc",
    "number": 30,
    "atomic_mass": 65.382
  },
  "Ga": {
    "name": "Gallium",
    "number": 31,
    "atomic_mass": 69.7231
  },
  "Ge": {
    "name": "Germanium",
    "number": 32,
    "atomic_mass": 72.6308
  },
  "As": {
    "name": "Arsenic",
    "number": 33,
    "atomic_mass": 74.9215956
  },
  "Se": {
    "name": "Selenium",
    "number": 34,
    "atomic_mass": 78.9718
  },
  "Br": {
    "name": "Bromine",
    "number": 35,
    "atomic_mass": 79.904
  },
  "Kr": {
    "name": "Krypton",
    "number": 36,
    "atomic_mass": 83.7982
  },
  "Rb": {
    "name": "Rubidium",
    "number": 37,
    "atomic_mass": 85.46783
  },
  "Sr": {
    "name": "Strontium",
    "number": 38,
    "atomic_mass": 87.621
  },
  "Y": {
    "name": "Yttrium",
    "number": 39,
    "atomic_mass": 88.905842
  },
  "Zr": {
    "name": "Zirconium",
    "number": 40,
    "atomic_mass": 91.2242
  },
  "Nb": {
    "name": "Niobium",
    "number": 41,
    "atomic_mass": 92.906372
  },
  "Mo": {
    "name": "Molybdenum",
    "number": 42,
    "atomic_mass": 95.951
  },
  "Tc": {
    "name": "Technetium",
    "number": 43,
    "atomic_mass": 98
  },
  "Ru": {
    "name": "Ruthenium",
    "number": 44,
    "atomic_mass": 101.072
  },
  "Rh": {
    "name": "Rhodium",
    "number": 45,
    "atomic_mass": 102.905502
  },
  "Pd": {
    "name": "Palladium",
    "number": 46,
    "atomic_mass": 106.421
  },
  "Ag": {
    "name": "Silver",
    "number": 47,
    "atomic_mass": 107.86822
  },
  "Cd": {
    "name": "Cadmium",
    "number": 48,
    "atomic_mass": 112.4144
  },
  "In": {
    "name": "Indium",
    "number": 49,
    "atomic_mass": 114.8181
  },
  "Sn": {
    "name": "Tin",
    "number": 50,
    "atomic_mass": 118.7107
  },
  "Sb": {
    "name": "Antimony",
    "number": 51,
    "atomic_mass": 121.7601
  },
  "Te": {
    "name": "Tellurium",
    "number": 52,
    "atomic_mass": 127.603
  },
  "I": {
    "name": "Iodine",
    "number": 53,
    "atomic_mass": 126.904473
  },
  "Xe": {
    "name": "Xenon",
    "number": 54,
    "atomic_mass": 131.2936
  },
  "Cs": {
    "name": "Cesium",
    "number": 55,
    "atomic_mass": 132.905451966
  },
  "Ba": {
    "name": "Barium",
    "number": 56,
    "atomic_mass": 137.3277
  },
  "La": {
    "name": "Lanthanum",
    "number": 57,
    "atomic_mass": 138.905477
  },
  "Ce": {
    "name": "Cerium",
    "number": 58,
    "atomic_mass": 140.1161
  },
  "Pr": {
    "name": "Praseodymium",
    "number": 59,
    "atomic_mass": 140.907662
  },
  "Nd": {
    "name": "Neodymium",
    "number": 60,
    "atomic_mass": 144.2423
  },
  "Pm": {
    "name": "Promethium",
    "number": 61,
    "atomic_mass": 145
  },
  "Sm": {
    "name": "Samarium",
    "number": 62,
    "atomic_mass": 150.362
  },
  "Eu": {
    "name": "Europium",
    "number": 63,
    "atomic_mass": 151.9641
  },
  "Gd": {
    "name": "Gadolinium",
    "number": 64,
    "atomic_mass": 157.253
  },
  "Tb": {
    "name": "Terbium",
    "number": 65,
    "atomic_mass": 158.925352
  },
  "Dy": {
    "name": "Dysprosium",
    "number": 66,
    "atomic_mass": 162.5001
  },
  "Ho": {
    "name": "Holmium",
    "number": 67,
    "atomic_mass": 164.930332
  },
  "Er": {
    "name": "Erbium",
    "number": 68,
    "atomic_mass": 167.2593
  },
  "Tm": {
    "name": "Thulium",
    "number": 69,
    "atomic_mass": 168.934222
  },
  "Yb": {
    "name": "Ytterbium",
    "number": 70,
    "atomic_mass": 173.0451
  },
  "Lu": {
    "name": "Lutetium",
    "number": 71,
    "atomic_mass": 174.96681
  },
  "Hf": {
    "name": "Hafnium",
    "number": 72,
    "atomic_mass": 178.492
  },
  "Ta": {
    "name": "Tantalum",
    "number": 73,
    "atomic_mass": 180.947882
  },
  "W": {
    "name": "Tungsten",
    "number": 74,
    "atomic_mass": 183.841
  },
  "Re": {
    "name": "Rhenium",
    "number": 75,
    "atomic_mass": 186.2071
  },
  "Os": {
    "name": "Osmium",
    "number": 76,
    "atomic_mass": 190.233
  },
  "Ir": {
    "name": "Iridium",
    "number": 77,
    "atomic_mass": 192.2173
  },
  "Pt": {
    "name": "Platinum",
    "number": 78,
    "atomic_mass": 195.0849
  },
  "Au": {
    "name": "Gold",
    "number": 79,
    "atomic_mass": 196.9665695
  },
  "Hg": {
    "name": "Mercury",
    "number": 80,
    "atomic_mass": 200.5923
  },
  "Tl": {
    "name": "Thallium",
    "number": 81,
    "atomic_mass": 204.38
  },
  "Pb": {
    "name": "Lead",
    "number": 82,
    "atomic_mass": 207.21
  },
  "Bi": {
    "name": "Bismuth",
    "number": 83,
    "atomic_mass": 208.980401
  },
  "Po": {
    "name": "Polonium",
    "number": 84,
    "atomic_mass": 209
  },
  "At": {
    "name": "Astatine",
    "number": 85,
    "atomic_mass": 210
  },
  "Rn": {
    "name": "Radon",
    "number": 86,
    "atomic_mass": 222
  },
  "Fr": {
    "name": "Francium",
    "number": 87,
    "atomic_mass": 223
  },
  "Ra": {
    "name": "Radium",
    "number": 88,
    "atomic_mass": 226
  },
  "Ac": {
    "name": "Actinium",
    "number": 89,
    "atomic_mass": 227
  },
  "Th": {
    "name": "Thorium",
    "number": 90,
    "atomic_mass": 232.03774
  },
  "Pa": {
    "name": "Protactinium",
    "number": 91,
    "atomic_mass": 231.035882
  },
  "U": {
    "name": "Uranium",
    "number": 92,
    "atomic_mass": 238.028913
  },
  "Np": {
    "name": "Neptunium",
    "number": 93,
    "atomic_mass": 237
  },
  "Pu": {
    "name": "Plutonium",
    "number": 94,
    "atomic_mass": 244
  },
  "Am": {
    "name": "Americium",
    "number": 95,
    "atomic_mass": 243
  },
  "Cm": {
    "name": "Curium",
    "number": 96,
    "atomic_mass": 247
  },
  "Bk": {
    "name": "Berkelium",
    "number": 97,
    "atomic_mass": 247
  },
  "Cf": {
    "name": "Californium",
    "number": 98,
    "atomic_mass": 251
  },
  "Es": {
    "name": "Einsteinium",
    "number": 99,
    "atomic_mass": 252
  },
  "Fm": {
    "name": "Fermium",
    "number": 100,
    "atomic_mass": 257
  },
  "Md": {
    "name": "Mendelevium",
    "number": 101,
    "atomic_mass": 258
  },
  "No": {
    "name": "Nobelium",
    "number": 102,
    "atomic_mass": 259
  },
  "Lr": {
    "name": "Lawrencium",
    "number": 103,
    "atomic_mass": 266
  },
  "Rf": {
    "name": "Rutherfordium",
    "number": 104,
    "atomic_mass": 267
  },
  "Db": {
    "name": "Dubnium",
    "number": 105,
    "atomic_mass": 268
  },
  "Sg": {
    "name": "Seaborgium",
    "number": 106,
    "atomic_mass": 269
  },
  "Bh": {
    "name": "Bohrium",
    "number": 107,
    "atomic_mass": 270
  },
  "Hs": {
    "name": "Hassium",
    "number": 108,
    "atomic_mass": 269
  },
  "Mt": {
    "name": "Meitnerium",
    "number": 109,
    "atomic_mass": 278
  },
  "Ds": {
    "name": "Darmstadtium",
    "number": 110,
    "atomic_mass": 281
  },
  "Rg": {
    "name": "Roentgenium",
    "number": 111,
    "atomic_mass": 282
  },
  "Cn": {
    "name": "Copernicium",
    "number": 112,
    "atomic_mass": 285
  },
  "Nh": {
    "name": "Nihonium",
    "number": 113,
    "atomic_mass": 286
  },
  "Fl": {
    "name": "Flerovium",
    "number": 114,
    "atomic_mass": 289
  },
  "Mc": {
    "name": "Moscovium",
    "number": 115,
    "atomic_mass": 289
  },
  "Lv": {
    "name": "Livermorium",
    "number": 116,
    "atomic_mass": 293
  },
  "Ts": {
    "name": "Tennessine",
    "number": 117,
    "atomic_mass": 294
  },
  "Og": {
    "name": "Oganesson",
    "number": 118,
    "atomic_mass": 294
  }
};
export default ELEMENTS;
