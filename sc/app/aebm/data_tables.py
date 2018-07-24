# modal weight factor
modal_weight = {
  1: {
    'S1': .75,
    'C1': .75,
    'PC1': .75,
    'URM': .75,
    'MH': 1.0,
    'other': .8
  },
  2: {
    'S1': .75,
    'C1': .75,
    'PC1': .75,
    'URM': .75,
    'other': .8
  },
  3: {
    'S1': .75,
    'C1': .75,
    'PC1': .75,
    'URM': .75,
    'MH': 1.0,
    'other': .8
  },
  4: {
    'S1': .75,
    'C1': .75,
    'MH': 1.0,
    'other': .8
  },
  5: {
    'S1': .75,
    'C1': .75,
    'MH': 1.0,
    'other': .8
  },
  6: {
    'S1': .73,
    'C1': .73,
    'other': .79
  },
  7: {
    'S1': .71,
    'C1': .71,
    'other': .78
  },
  8: {
    'S1': .69,
    'C1': .69,
    'other': .77
  },
  9: {
    'S1': .67,
    'C1': .67,
    'other': .76
  },
  10: {
    'S1': .65,
    'C1': .65,
    'other': .75
  },
  11: {
    'S1': .65,
    'C1': .65,
    'other': .75
  },
  12: {
    'S1': .65,
    'C1': .65,
    'other': .75
  },
  13: {
    'S1': .65,
    'C1': .65,
    'other': .75
  },
  14: {
    'S1': .65,
    'C1': .65,
    'other': .75
  },
  15: {
    'S1': .65,
    'C1': .65,
    'other': .75
  },
  100: {
    'S1': .65,
    'C1': .65,
    'other': .75
  },
}

# modal height factor
modal_height = {
  1: {
    'MH': 1.0,
    'other': .75
  },
  2: {
    'other': .75
  },
  3: {
    'other': .75
  },
  4: {
    'other': .75
  },
  5: {
    'other': .75
  },
  6: {
    'other': .72
  },
  7: {
    'other': .69
  },
  8: {
    'other': .66
  },
  9: {
    'other': .63
  },
  10: {
    'other': .60
  },
  11: {
    'other': .60
  },
  12: {
    'other': .60
  },
  13: {
    'other': .60
  },
  14: {
    'other': .60
  },
  15: {
    'other': .60
  },
  100: {
    'other': .60
  }
}

modal_shape_factor = {
    1: {
        'slight': 1.0,
        'moderate': 1.0,
        'extensive': None,
        'complete': None,
    },
    2: {
        'slight': 1.21,
        'moderate': 1.21,
        'extensive': None,
        'complete': None,
    },
    3: {
        'slight': 1.35,
        'moderate': 1.35,
        'extensive': None,
        'complete': None,
    },
    4: {
        'slight': 1.45,
        'moderate': 1.45,
        'extensive': None,
        'complete': None,
    },
    5: {
        'slight': 1.54,
        'moderate': 1.54,
        'extensive': None,
        'complete': None,
    },
    6: {
        'slight': 1.62,
        'moderate': 1.62,
        'extensive': None,
        'complete': None,
    },
    7: {
        'slight': 1.69,
        'moderate': 1.69,
        'extensive': None,
        'complete': None,
    },
    8: {
        'slight': 1.75,
        'moderate': 1.75,
        'extensive': None,
        'complete': None,
    },
    9: {
        'slight': 1.81,
        'moderate': 1.81,
        'extensive': None,
        'complete': None,
    },
    10: {
        'slight': 1.86,
        'moderate': 1.86,
        'extensive': None,
        'complete': None,
    },
    11: {
        'slight': 1.91,
        'moderate': 1.91,
        'extensive': None,
        'complete': None,
    },
    12: {
        'slight': 1.96,
        'moderate': 1.96,
        'extensive': None,
        'complete': None,
    },
    13: {
        'slight': 2.0,
        'moderate': 2.0,
        'extensive': None,
        'complete': None,
    },
    14: {
        'slight': 2.04,
        'moderate': 2.04,
        'extensive': None,
        'complete': None,
    },
    15: {
        'slight': 2.08,
        'moderate': 2.08,
        'extensive': None,
        'complete': None,
    },
    100: {
        'slight': 2.08,
        'moderate': 2.08,
        'extensive': None,
        'complete': None,
    },
}

# interstory drift ratio
interstory_drift = {
  'special_high_baseline': {
    'C1': {
      'slight': .0063,
      'moderate': .0125,
      'extensive': .038,
      'complete': .1
    },
    'C2': {
      'slight': .005,
      'moderate': .0125,
      'extensive': .038,
      'complete': .1
    },
    'C3': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .0875
    },
    'PC2': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .0875
    },
    'RM1': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .0875
    },
    'RM2': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .088
    },
    'S1': {
      'slight': .0075,
      'moderate': .015,
      'extensive': .0375,
      'complete': .1 
    },
    'S2': {
      'slight': .0063,
      'moderate': .013,
      'extensive': .0375,
      'complete': .1 
    },
    'S3': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .0875 
    },
    'S4': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .0875
    },
    'S5': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'URM': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'W1': {
      'slight': .005,
      'moderate': .015,
      'extensive': .05,
      'complete': .125
    },
    'W1A': {
      'slight': .005,
      'moderate': .015,
      'extensive': .05,
      'complete': .125
    },
    'W2': {
      'slight': .005,
      'moderate': .015,
      'extensive': .05,
      'complete': .125
    }
  },
  'high_baseline': {
    'C1': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .8
    },
    'C2': {
      'slight': .004,
      'moderate': .01,
      'extensive': .03,
      'complete': .8
    },
    'C3': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .004,
      'moderate': .008,
      'extensive': .024,
      'complete': .07
    },
    'PC2': {
      'slight': .004,
      'moderate': .008,
      'extensive': .024,
      'complete': .07
    },
    'RM1': {
      'slight': .004,
      'moderate': .008,
      'extensive': .024,
      'complete': .07
    },
    'RM2': {
      'slight': .004,
      'moderate': .008,
      'extensive': .024,
      'complete': .07
    },
    'S1': {
      'slight': .006,
      'moderate': .012,
      'extensive': .03,
      'complete': .08
    },
    'S2': {
      'slight': .005,
      'moderate': .01,
      'extensive': .03,
      'complete': .08
    },
    'S3': {
      'slight': .004,
      'moderate': .008,
      'extensive': .024,
      'complete': .07 
    },
    'S4': {
      'slight': .004,
      'moderate': .008,
      'extensive': .024,
      'complete': .07
    },
    'S5': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'URM': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'W1': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'W1A': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'W2': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    }
  },
  'moderate_baseline': {
    'C1': {
      'slight': .005,
      'moderate': .009,
      'extensive': .023,
      'complete': .06
    },
    'C2': {
      'slight': .004,
      'moderate': .008,
      'extensive': .023,
      'complete': .06
    },
    'C3': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'PC2': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'RM1': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'RM2': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'S1': {
      'slight': .006,
      'moderate': .01,
      'extensive': .024,
      'complete': .06
    },
    'S2': {
      'slight': .005,
      'moderate': .009,
      'extensive': .023,
      'complete': .06
    },
    'S3': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'S4': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'S5': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'URM': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'W1': {
      'slight': .004,
      'moderate': .01,
      'extensive': .031,
      'complete': .075
    },
    'W1A': {
      'slight': .004,
      'moderate': .01,
      'extensive': .031,
      'complete': .075
    },
    'W2': {
      'slight': .004,
      'moderate': .01,
      'extensive': .031,
      'complete': .075
    }
  },
  'high_poor': {
    'C1': {
      'slight': .005,
      'moderate': .009,
      'extensive': .023,
      'complete': .06
    },
    'C2': {
      'slight': .004,
      'moderate': .008,
      'extensive': .023,
      'complete': .06
    },
    'C3': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'PC2': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'RM1': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'RM2': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'S1': {
      'slight': .006,
      'moderate': .01,
      'extensive': .024,
      'complete': .06
    },
    'S2': {
      'slight': .005,
      'moderate': .009,
      'extensive': .023,
      'complete': .06
    },
    'S3': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'S4': {
      'slight': .004,
      'moderate': .007,
      'extensive': .019,
      'complete': .053
    },
    'S5': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'URM': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'W1': {
      'slight': .004,
      'moderate': .01,
      'extensive': .031,
      'complete': .075
    },
    'W1A': {
      'slight': .004,
      'moderate': .01,
      'extensive': .031,
      'complete': .075
    },
    'W2': {
      'slight': .004,
      'moderate': .01,
      'extensive': .031,
      'complete': .075
    }
  },
  'low_baseline': {
    'C1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'C2': {
      'slight': .004,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'C3': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'PC2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'RM1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'RM2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'S1': {
      'slight': .006,
      'moderate': .01,
      'extensive': .02,
      'complete': .05
    },
    'S2': {
      'slight': .005,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'S3': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'S4': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'S5': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'URM': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'W1': {
      'slight': .004,
      'moderate': .01,
      'extensive': .025,
      'complete': .06
    },
    'W1A': {
      'slight': .004,
      'moderate': .01,
      'extensive': .025,
      'complete': .06
    },
    'W2': {
      'slight': .004,
      'moderate': .01,
      'extensive': .025,
      'complete': .06
    },
  },
  'moderate_poor': {
    'C1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'C2': {
      'slight': .004,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'C3': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'PC2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'RM1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'RM2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'S1': {
      'slight': .006,
      'moderate': .01,
      'extensive': .02,
      'complete': .05
    },
    'S2': {
      'slight': .005,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'S3': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'S4': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .044
    },
    'S5': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'URM': {
      'slight': .003,
      'moderate': .006,
      'extensive': .015,
      'complete': .035
    },
    'W1': {
      'slight': .004,
      'moderate': .01,
      'extensive': .025,
      'complete': .06
    },
    'W1A': {
      'slight': .004,
      'moderate': .01,
      'extensive': .025,
      'complete': .06
    },
    'W2': {
      'slight': .004,
      'moderate': .01,
      'extensive': .025,
      'complete': .06
    }
  },
  'pre_baseline': {
    'C1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'C2': {
      'slight': .003,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'C3': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'PC2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'RM1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'RM2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .016,
      'complete': .04
    },
    'S2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'S3': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S4': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S5': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'URM': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'W1': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'W1A': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'W2': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    }
  },
  'low_poor': {
    'C1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'C2': {
      'slight': .003,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'C3': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'PC2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'RM1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'RM2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .016,
      'complete': .04
    },
    'S2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'S3': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S4': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S5': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'URM': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'W1': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'W1A': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'W2': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    }
  },
  'high_very_poor': {
    'C1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'C2': {
      'slight': .003,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'C3': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'PC2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'RM1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'RM2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .016,
      'complete': .04
    },
    'S2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .016,
      'complete': .04
    },
    'S3': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S4': {
      'slight': .003,
      'moderate': .005,
      'extensive': .013,
      'complete': .035
    },
    'S5': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'URM': {
      'slight': .002,
      'moderate': .005,
      'extensive': .012,
      'complete': .028
    },
    'W1': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'W1A': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    },
    'W2': {
      'slight': .003,
      'moderate': .008,
      'extensive': .02,
      'complete': .05
    }
  },
  'pre_poor': {
    'C1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .0115,
      'complete': .03
    },
    'C2': {
      'slight': .003,
      'moderate': .006,
      'extensive': .0115,
      'complete': .03
    },
    'C3': {
      'slight': .002,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'PC2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'RM1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'RM2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .027
    },
    'S1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .012,
      'complete':.03 
    },
    'S2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .012,
      'complete':.03 
    },
    'S3': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265 
    },
    'S4': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'S5': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .0175
    },
    'URM': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .0175
    },
    'W1': {
      'slight': .003,
      'moderate': .008,
      'extensive': .018,
      'complete': .045
    },
    'W1A': {
      'slight': .003,
      'moderate': .008,
      'extensive': .018,
      'complete': .045
    },
    'W2': {
      'slight': .003,
      'moderate': .008,
      'extensive': .018,
      'complete': .045
    }
  },
  'moderate_very_poor': {
    'C1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .0115,
      'complete': .03
    },
    'C2': {
      'slight': .003,
      'moderate': .006,
      'extensive': .0115,
      'complete': .03
    },
    'C3': {
      'slight': .002,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'PC2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'RM1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'RM2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .027
    },
    'S1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .012,
      'complete':.03 
    },
    'S2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .012,
      'complete':.03 
    },
    'S3': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265 
    },
    'S4': {
      'slight': .003,
      'moderate': .005,
      'extensive': .0095,
      'complete': .0265
    },
    'S5': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .0175
    },
    'URM': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .0175
    },
    'W1': {
      'slight': .003,
      'moderate': .008,
      'extensive': .018,
      'complete': .045
    },
    'W1A': {
      'slight': .003,
      'moderate': .008,
      'extensive': .018,
      'complete': .045
    },
    'W2': {
      'slight': .003,
      'moderate': .008,
      'extensive': .018,
      'complete': .045
    }
  },
  'low_very_poor': {
    'C1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .01,
      'complete': .025
    },
    'C2': {
      'slight': .003,
      'moderate': .006,
      'extensive': .01,
      'complete': .025
    },
    'C3': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .0175
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .022
    },
    'PC2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .022
    },
    'RM1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .022
    },
    'RM2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .022
    },
    'S1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .01,
      'complete': .025
    },
    'S2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .01,
      'complete': .025
    },
    'S3': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .022
    },
    'S4': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .022
    },
    'S5': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .0175
    },
    'URM': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .0175
    },
    'W1': {
      'slight': .003,
      'moderate': .008,
      'extensive': .015,
      'complete': .0375
    },
    'W1A': {
      'slight': .003,
      'moderate': .008,
      'extensive': .015,
      'complete': .0375
    },
    'W2': {
      'slight': .003,
      'moderate': .008,
      'extensive': .015,
      'complete': .0375
    }
  },
  'pre_very_poor': {
    'C1': {
      'slight': .004,
      'moderate': .006,
      'extensive': .01,
      'complete': .02
    },
    'C2': {
      'slight': .003,
      'moderate': .006,
      'extensive': .01,
      'complete': .02
    },
    'C3': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .014
    },
    'MH': {
      'slight': .004,
      'moderate': .012,
      'extensive': .04,
      'complete': .1
    },
    'PC1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'PC2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'RM1': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'RM2': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'S1': {
      'slight': .005,
      'moderate': .008,
      'extensive': .01,
      'complete': .02
    },
    'S2': {
      'slight': .004,
      'moderate': .006,
      'extensive': .01,
      'complete': .02
    },
    'S3': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'S4': {
      'slight': .003,
      'moderate': .005,
      'extensive': .008,
      'complete': .0175
    },
    'S5': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .014
    },
    'URM': {
      'slight': .002,
      'moderate': .005,
      'extensive': .0075,
      'complete': .014
    },
    'W1': {
      'slight': .003,
      'moderate': .008,
      'extensive': .015,
      'complete': .03
    },
    'W1A': {
      'slight': .003,
      'moderate': .008,
      'extensive': .015,
      'complete': .03
    },
    'W2': {
      'slight': .003,
      'moderate': .008,
      'extensive': .015,
      'complete': .03
    }
  }
}

default_beta = {
    'best': {
        'baseline': {
            'post-1975': {
                1: .6,
                2: .6,
                3: .6,
                4: .59,
                5: .58,
                6: .57,
                7: .56,
                8: .55,
                9: .54,
                10: .53,
                11: .52,
                12: .51,
                13: .50,
                14: .50,
                15: .50
            },
            '1960-1975': {
                1: .65,
                2: .65,
                3: .65,
                4: .64,
                5: .63,
                6: .62,
                7: .61,
                8: .6,
                9: .59,
                10: .58,
                11: .57,
                12: .56,
                13: .55,
                14: .55,
                15: .55
            },
            '1941-1960': {
                1: .7,
                2: .7,
                3: .7,
                4: .69,
                5: .68,
                6: .67,
                7: .66,
                8: .65,
                9: .64,
                10: .63,
                11: .62,
                12: .61,
                13: .60,
                14: .60,
                15: .60 
            },
            'pre-1941': {
                1: .8,
                2: .8,
                3: .8,
                4: .79,
                5: .78,
                6: .77,
                7: .76,
                8: .75,
                9: .74,
                10: .73,
                11: .72,
                12: .71,
                13: .7,
                14: .7,
                15: .7
            }
        },
        'non-baseline': {
            'pre-1941': {
                1: .8,
                2: .8,
                3: .8,
                4: .79,
                5: .78,
                6: .77,
                7: .76,
                8: .75,
                9: .74,
                10: .73,
                11: .72,
                12: .71,
                13: .7,
                14: .7,
                15: .7
            },
            '1960-1975': {
                1: .85,
                2: .85,
                3: .85,
                4: .84,
                5: .83,
                6: .82,
                7: .81,
                8: .7,
                9: .79,
                10: .78,
                11: .77,
                12: .76,
                13: .75,
                14: .75,
                15: .75
            },
            '1941-1960': {
                1: .9,
                2: .9,
                3: .9,
                4: .89,
                5: .88,
                6: .87,
                7: .86,
                8: .85,
                9: .84,
                10: .83,
                11: .82,
                12: .81,
                13: .80,
                14: .80,
                15: .80 
            },
            'pre-1941': {
                1: .95,
                2: .95,
                3: .95,
                4: .94,
                5: .93,
                6: .92,
                7: .91,
                8: .90,
                9: .89,
                10: .88,
                11: .87,
                12: .86,
                13: .85,
                14: .85,
                15: .85
            }
        }
    },
    'very_good': {
        'baseline': {
            'post-1975': {
                1: .7,
                2: .7,
                3: .7,
                4: .69,
                5: .68,
                6: .67,
                7: .66,
                8: .65,
                9: .64,
                10: .63,
                11: .62,
                12: .61,
                13: .60,
                14: .60,
                15: .60 
            },
            '1960-1975': {
                1: .75,
                2: .75,
                3: .75,
                4: .74,
                5: .73,
                6: .72,
                7: .71,
                8: .7,
                9: .69,
                10: .68,
                11: .67,
                12: .66,
                13: .65,
                14: .65,
                15: .65
            },
            '1941-1960': {
                1: .8,
                2: .8,
                3: .8,
                4: .79,
                5: .78,
                6: .77,
                7: .76,
                8: .75,
                9: .74,
                10: .73,
                11: .72,
                12: .71,
                13: .7,
                14: .7,
                15: .7
            },
            'pre-1941': {
                1: .85,
                2: .85,
                3: .85,
                4: .84,
                5: .83,
                6: .82,
                7: .81,
                8: .7,
                9: .79,
                10: .78,
                11: .77,
                12: .76,
                13: .75,
                14: .75,
                15: .75
            }
        },
        'non-baseline': {
            'post-1975': {
                1: .85,
                2: .85,
                3: .85,
                4: .84,
                5: .83,
                6: .82,
                7: .81,
                8: .7,
                9: .79,
                10: .78,
                11: .77,
                12: .76,
                13: .75,
                14: .75,
                15: .75
            },
            '1960-1975': {
                1: .9,
                2: .9,
                3: .9,
                4: .89,
                5: .88,
                6: .87,
                7: .86,
                8: .85,
                9: .84,
                10: .83,
                11: .82,
                12: .81,
                13: .80,
                14: .80,
                15: .80 
            },
            '1941-1960': {
                1: .95,
                2: .95,
                3: .95,
                4: .94,
                5: .93,
                6: .92,
                7: .91,
                8: .90,
                9: .89,
                10: .88,
                11: .87,
                12: .86,
                13: .85,
                14: .85,
                15: .85
            },
            'pre-1941': {
                1: 1.0,
                2: 1.0,
                3: 1.0,
                4: .99,
                5: .98,
                6: .97,
                7: .96,
                8: .95,
                9: .94,
                10: .93,
                11: .92,
                12: .91,
                13: .9,
                14: .9,
                15: .9
            }
        }
    },
    'good': {
        'baseline': {
            'post-1975': {
                1: .8,
                2: .8,
                3: .8,
                4: .79,
                5: .78,
                6: .77,
                7: .76,
                8: .75,
                9: .74,
                10: .73,
                11: .72,
                12: .71,
                13: .7,
                14: .7,
                15: .7
            },
            '1960-1975': {
                1: .85,
                2: .85,
                3: .85,
                4: .84,
                5: .83,
                6: .82,
                7: .81,
                8: .7,
                9: .79,
                10: .78,
                11: .77,
                12: .76,
                13: .75,
                14: .75,
                15: .75
            },
            '1941-1960': {
                1: .9,
                2: .9,
                3: .9,
                4: .89,
                5: .88,
                6: .87,
                7: .86,
                8: .85,
                9: .84,
                10: .83,
                11: .82,
                12: .81,
                13: .80,
                14: .80,
                15: .80 
            },
            'pre-1941': {
                1: .95,
                2: .95,
                3: .95,
                4: .94,
                5: .93,
                6: .92,
                7: .91,
                8: .90,
                9: .89,
                10: .88,
                11: .87,
                12: .86,
                13: .85,
                14: .85,
                15: .85
            }
        },
        'non-baseline': {
            'post-1975': {
                1: .9,
                2: .9,
                3: .9,
                4: .89,
                5: .88,
                6: .87,
                7: .86,
                8: .85,
                9: .84,
                10: .83,
                11: .82,
                12: .81,
                13: .80,
                14: .80,
                15: .80 
            },
            '1960-1975': {
                1: .95,
                2: .95,
                3: .95,
                4: .94,
                5: .93,
                6: .92,
                7: .91,
                8: .90,
                9: .89,
                10: .88,
                11: .87,
                12: .86,
                13: .85,
                14: .85,
                15: .85
            },
            '1941-1960': {
                1: 1.0,
                2: 1.0,
                3: 1.0,
                4: .99,
                5: .98,
                6: .97,
                7: .96,
                8: .95,
                9: .94,
                10: .93,
                11: .92,
                12: .91,
                13: .9,
                14: .9,
                15: .9
            },
            'pre-1941': {
                1: 1.05,
                2: 1.05,
                3: 1.05,
                4: 1.04,
                5: 1.03,
                6: 1.02,
                7: 1.01,
                8: 1.0,
                9: .99,
                10: .98,
                11: .97,
                12: .96,
                13: .95,
                14: .95,
                15: .95
            }
        }
    },
    'poor': {
        'baseline': {
            'post-1975': {
                1: .9,
                2: .9,
                3: .9,
                4: .89,
                5: .88,
                6: .87,
                7: .86,
                8: .85,
                9: .84,
                10: .83,
                11: .82,
                12: .81,
                13: .80,
                14: .80,
                15: .80 
            },
            '1960-1975': {
                1: .95,
                2: .95,
                3: .95,
                4: .94,
                5: .93,
                6: .92,
                7: .91,
                8: .90,
                9: .89,
                10: .88,
                11: .87,
                12: .86,
                13: .85,
                14: .85,
                15: .85
            },
            '1941-1960': {
                1: 1.0,
                2: 1.0,
                3: 1.0,
                4: .99,
                5: .98,
                6: .97,
                7: .96,
                8: .95,
                9: .94,
                10: .93,
                11: .92,
                12: .91,
                13: .9,
                14: .9,
                15: .9
            },
            'pre-1941': {
                1: 1.05,
                2: 1.05,
                3: 1.05,
                4: 1.04,
                5: 1.03,
                6: 1.02,
                7: 1.01,
                8: 1.0,
                9: .99,
                10: .98,
                11: .97,
                12: .96,
                13: .95,
                14: .95,
                15: .95
            }
        },
        'non-baseline': {
            'post-1975': {
                1: .95,
                2: .95,
                3: .95,
                4: .94,
                5: .93,
                6: .92,
                7: .91,
                8: .90,
                9: .89,
                10: .88,
                11: .87,
                12: .86,
                13: .85,
                14: .85,
                15: .85
            },
            '1960-1975': {
                1: 1.0,
                2: 1.0,
                3: 1.0,
                4: .99,
                5: .98,
                6: .97,
                7: .96,
                8: .95,
                9: .94,
                10: .93,
                11: .92,
                12: .91,
                13: .9,
                14: .9,
                15: .9
            },
            '1941-1960': {
                1: 1.05,
                2: 1.05,
                3: 1.05,
                4: 1.04,
                5: 1.03,
                6: 1.02,
                7: 1.01,
                8: 1.0,
                9: .99,
                10: .98,
                11: .97,
                12: .96,
                13: .95,
                14: .95,
                15: .95
            },
            'pre-1941': {
                1: 1.1,
                2: 1.1,
                3: 1.1,
                4: 1.09,
                5: 1.08,
                6: 1.07,
                7: 1.06,
                8: 1.05,
                9: 1.04,
                10: 1.03,
                11: 1.02,
                12: 1.01,
                13: 1.0,
                14: 1.0,
                15: 1.0 
            }
        }
    },
    'very_poor': {
        'baseline': {
            'post-1975': {
                1: 1.0,
                2: 1.0,
                3: 1.0,
                4: .99,
                5: .98,
                6: .97,
                7: .96,
                8: .95,
                9: .94,
                10: .93,
                11: .92,
                12: .91,
                13: .9,
                14: .9,
                15: .9
            },
            '1960-1975': {
                1: 1.05,
                2: 1.05,
                3: 1.05,
                4: 1.04,
                5: 1.03,
                6: 1.02,
                7: 1.01,
                8: 1.0,
                9: .99,
                10: .98,
                11: .97,
                12: .96,
                13: .95,
                14: .95,
                15: .95
            },
            '1941-1960': {
                1: 1.1,
                2: 1.1,
                3: 1.1,
                4: 1.09,
                5: 1.08,
                6: 1.07,
                7: 1.06,
                8: 1.05,
                9: 1.04,
                10: 1.03,
                11: 1.02,
                12: 1.01,
                13: 1.0,
                14: 1.0,
                15: 1.0 
            },
            'pre-1941': {
                1: 1.15,
                2: 1.15,
                3: 1.15,
                4: 1.14,
                5: 1.13,
                6: 1.12,
                7: 1.11,
                8: 1.10,
                9: 1.09,
                10: 1.08,
                11: 1.07,
                12: 1.06,
                13: 1.05,
                14: 1.05,
                15: 1.05
            }
        },
        'non-baseline': {
            'post-1975': {
                1: 1.0,
                2: 1.0,
                3: 1.0,
                4: .99,
                5: .98,
                6: .97,
                7: .96,
                8: .95,
                9: .94,
                10: .93,
                11: .92,
                12: .91,
                13: .9,
                14: .9,
                15: .9
            },
            '1960-1975': {
                1: 1.05,
                2: 1.05,
                3: 1.05,
                4: 1.04,
                5: 1.03,
                6: 1.02,
                7: 1.01,
                8: 1.0,
                9: .99,
                10: .98,
                11: .97,
                12: .96,
                13: .95,
                14: .95,
                15: .95
            },
            '1941-1960': {
                1: 1.1,
                2: 1.1,
                3: 1.1,
                4: 1.09,
                5: 1.08,
                6: 1.07,
                7: 1.06,
                8: 1.05,
                9: 1.04,
                10: 1.03,
                11: 1.02,
                12: 1.01,
                13: 1.0,
                14: 1.0,
                15: 1.0 
            },
            'pre-1941': {
                1: 1.2,
                2: 1.2,
                3: 1.2,
                4: 1.19,
                5: 1.18,
                6: 1.17,
                7: 1.16,
                8: 1.15,
                9: 1.14,
                10: 1.13,
                11: 1.12,
                12: 1.11,
                13: 1.1,
                14: 1.1,
                15: 1.1 
            }
        }
    }
}

degradation_factor = {
    'baseline': {
        'post-1975': {
            '<=6.25': {
                0: .9,
                1: .9,
                2: .9,
                3: .9,
                4: .9,
                5: .9,
                6: .9,
                7: .9,
                8: .89,
                9: .88,
                10: .86,
                11: .85,
                12: .84,
                13: .83,
                14: .81,
                15: .8,
                20: .75,
                25: .70,
                30: .65,
                35: .6,
                40: .57,
                45: .53,
                50: .5,
                1000: .5
            },
            '<=6.5': {
                0: .9,
                1: .9,
                2: .9,
                3: .9,
                4: .9,
                5: .88,
                6: .87,
                7: .85,
                8: .84,
                9: .83,
                10: .81,
                11: .8,
                12: .79,
                13: .78,
                14: .76,
                15: .75,
                20: .7,
                25: .65,
                30: .6,
                35: .55,
                40: .53,
                45: .52,
                50: .5,
                1000: .5
            },
            '<=6.75': {
                0: .9,
                1: .9,
                2: .9,
                3: .9,
                4: .9,
                5: .87,
                6: .83,
                7: .8,
                8: .79,
                9: .78,
                10: .76,
                11: .75,
                12: .74,
                13: .73,
                14: .71,
                15: .7,
                20: .65,
                25: .6,
                30: .55,
                35: .5,
                40: .5,
                45: .5,
                50: .5,
                1000: .5
            },
            '<=7': {
                0: .9,
                1: .9,
                2: .9,
                3: .9,
                4: .9,
                5: .87,
                6: .83,
                7: .8,
                8: .78,
                9: .76,
                10: .74,
                11: .73,
                12: .71,
                13: .69,
                14: .67,
                15: .65,
                20: .61,
                25: .58,
                30: .54,
                35: .5,
                40: .5,
                45: .5,
                50: .5,
                1000: .5
            },
            '>=7.25': {
                0: .9,
                1: .9,
                2: .9,
                3: .9,
                4: .9,
                5: .87,
                6: .83,
                7: .8,
                8: .78,
                9: .75,
                10: .73,
                11: .7,
                12: .68,
                13: .65,
                14: .63,
                15: .6,
                20: .58,
                25: .55,
                30: .53,
                35: .5,
                40: .5,
                45: .5,
                50: .5,
                1000: .5
            }
        },
        '1960-1975': {
            '<=6.25': {
                0: .8,
                1: .8,
                2: .8,
                3: .8,
                4: .8,
                5: .8,
                6: .8,
                7: .8,
                8: .79,
                9: .78,
                10: .76,
                11: .75,
                12: .74,
                13: .73,
                14: .71,
                15: .7,
                20: .65,
                25: .60,
                30: .55,
                35: .50,
                40: .47,
                45: .43,
                50: .4,
                1000: .4
            },
            '<=6.5': {
                0: .8,
                1: .8,
                2: .8,
                3: .8,
                4: .8,
                5: .78,
                6: .77,
                7: .75,
                8: .74,
                9: .73,
                10: .71,
                11: .7,
                12: .69,
                13: .68,
                14: .66,
                15: .65,
                20: .6,
                25: .55,
                30: .5,
                35: .45,
                40: .43,
                45: .42,
                50: .4,
                1000: .4
            },
            '<=6.75': {
                0: .8,
                1: .8,
                2: .8,
                3: .8,
                4: .8,
                5: .77,
                6: .73,
                7: .7,
                8: .69,
                9: .68,
                10: .66,
                11: .65,
                12: .64,
                13: .63,
                14: .61,
                15: .6,
                20: .55,
                25: .5,
                30: .45,
                35: .4,
                40: .4,
                45: .4,
                50: .4,
                1000: .4
            },
            '<=7': {
                0: .8,
                1: .8,
                2: .8,
                3: .8,
                4: .8,
                5: .77,
                6: .73,
                7: .7,
                8: .68,
                9: .66,
                10: .64,
                11: .63,
                12: .61,
                13: .59,
                14: .57,
                15: .55,
                20: .51,
                25: .48,
                30: .44,
                35: .4,
                40: .4,
                45: .4,
                50: .4,
                1000: .4
            },
            '>=7.25': {
                0: .8,
                1: .8,
                2: .8,
                3: .8,
                4: .8,
                5: .77,
                6: .73,
                7: .7,
                8: .68,
                9: .65,
                10: .63,
                11: .6,
                12: .58,
                13: .55,
                14: .53,
                15: .5,
                20: .48,
                25: .45,
                30: .43,
                35: .4,
                40: .4,
                45: .4,
                50: .4,
                1000: .4
            }
        },
        '1941-1959': {
            '<=6.25': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .7,
                6: .7,
                7: .7,
                8: .69,
                9: .68,
                10: .66,
                11: .65,
                12: .64,
                13: .63,
                14: .61,
                15: .6,
                20: .55,
                25: .5,
                30: .45,
                35: .4,
                40: .37,
                45: .33,
                50: .3,
                1000: .3
            },
            '<=6.5': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .68,
                6: .67,
                7: .65,
                8: .64,
                9: .63,
                10: .61,
                11: .6,
                12: .59,
                13: .58,
                14: .56,
                15: .55,
                20: .5,
                25: .45,
                30: .4,
                35: .35,
                40: .33,
                45: .32,
                50: .3,
                1000: .3
            },
            '<=6.75': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .67,
                6: .63,
                7: .6,
                8: .59,
                9: .58,
                10: .56,
                11: .55,
                12: .54,
                13: .53,
                14: .51,
                15: .5,
                20: .45,
                25: .4,
                30: .35,
                35: .3,
                40: .3,
                45: .3,
                50: .3,
                1000: .3
            },
            '<=7': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .67,
                6: .63,
                7: .6,
                8: .58,
                9: .56,
                10: .54,
                11: .53,
                12: .51,
                13: .49,
                14: .47,
                15: .45,
                20: .41,
                25: .38,
                30: .34,
                35: .3,
                40: .3,
                45: .3,
                50: .3,
                1000: .3
            },
            '>=7.25': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .67,
                6: .63,
                7: .6,
                8: .58,
                9: .55,
                10: .53,
                11: .5,
                12: .48,
                13: .45,
                14: .43,
                15: .4,
                20: .38,
                25: .35,
                30: .33,
                35: .3,
                40: .3,
                45: .3,
                50: .3,
                1000: .3
            }
        },
        'pre-1941': {
            '<=6.25': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .6,
                6: .6,
                7: .6,
                8: .59,
                9: .58,
                10: .56,
                11: .55,
                12: .54,
                13: .53,
                14: .51,
                15: .5,
                20: .45,
                25: .4,
                30: .35,
                35: .3,
                40: .27,
                45: .23,
                50: .2,
                1000: .2
            },
            '<=6.5': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .58,
                6: .57,
                7: .55,
                8: .54,
                9: .53,
                10: .51,
                11: .5,
                12: .49,
                13: .48,
                14: .46,
                15: .45,
                20: .4,
                25: .35,
                30: .3,
                35: .25,
                40: .23,
                45: .22,
                50: .2,
                1000: .2
            },
            '<=6.75': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .57,
                6: .53,
                7: .5,
                8: .49,
                9: .48,
                10: .46,
                11: .45,
                12: .44,
                13: .43,
                14: .41,
                15: .4,
                20: .35,
                25: .3,
                30: .25,
                35: .2,
                40: .2,
                45: .2,
                50: .2,
                1000: .2
            },
            '<=7': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .57,
                6: .53,
                7: .5,
                8: .48,
                9: .45,
                10: .43,
                11: .4,
                12: .38,
                13: .35,
                14: .33,
                15: .3,
                20: .28,
                25: .25,
                30: .23,
                35: .2,
                40: .2,
                45: .2,
                50: .2,
                1000: .2
            },
            '>=7.25': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .57,
                6: .53,
                7: .5,
                8: .48,
                9: .45,
                10: .43,
                11: .4,
                12: .38,
                13: .35,
                14: .33,
                15: .3,
                20: .28,
                25: .25,
                30: .23,
                35: .2,
                40: .2,
                45: .2,
                50: .2,
                1000: .2
            }
        }
    },
    'non-baseline': {
        'post-1975': {
            '<=6.25': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .7,
                6: .7,
                7: .7,
                8: .69,
                9: .68,
                10: .66,
                11: .65,
                12: .64,
                13: .63,
                14: .61,
                15: .6,
                20: .55,
                25: .5,
                30: .45,
                35: .4,
                40: .37,
                45: .33,
                50: .3,
                1000: .3
            },
            '<=6.5': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .68,
                6: .67,
                7: .65,
                8: .64,
                9: .63,
                10: .61,
                11: .6,
                12: .59,
                13: .58,
                14: .56,
                15: .55,
                20: .5,
                25: .45,
                30: .4,
                35: .35,
                40: .33,
                45: .32,
                50: .3,
                1000: .3
            },
            '<=6.75': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .58,
                6: .57,
                7: .55,
                8: .54,
                9: .53,
                10: .51,
                11: .5,
                12: .49,
                13: .48,
                14: .46,
                15: .45,
                20: .4,
                25: .35,
                30: .3,
                35: .25,
                40: .23,
                45: .22,
                50: .2,
                1000: .2
            },
            '<=7': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .67,
                6: .63,
                7: .6,
                8: .58,
                9: .56,
                10: .54,
                11: .53,
                12: .51,
                13: .49,
                14: .47,
                15: .45,
                20: .41,
                25: .38,
                30: .34,
                35: .3,
                40: .3,
                45: .3,
                50: .3,
                1000: .3
            },
            '>=7.25': {
                0: .7,
                1: .7,
                2: .7,
                3: .7,
                4: .7,
                5: .67,
                6: .63,
                7: .6,
                8: .58,
                9: .55,
                10: .53,
                11: .5,
                12: .48,
                13: .45,
                14: .43,
                15: .4,
                20: .38,
                25: .35,
                30: .33,
                35: .3,
                40: .3,
                45: .3,
                50: .3,
                1000: .3
            }
        },
        '1960-1975': {
            '<=6.25': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .6,
                6: .6,
                7: .6,
                8: .59,
                9: .58,
                10: .56,
                11: .55,
                12: .54,
                13: .53,
                14: .51,
                15: .5,
                20: .45,
                25: .4,
                30: .35,
                35: .3,
                40: .27,
                45: .23,
                50: .2,
                1000: .2
            },
            '<=6.5': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .58,
                6: .57,
                7: .55,
                8: .54,
                9: .53,
                10: .51,
                11: .5,
                12: .49,
                13: .48,
                14: .46,
                15: .45,
                20: .4,
                25: .35,
                30: .3,
                35: .25,
                40: .23,
                45: .22,
                50: .2,
                1000: .2
            },
            '<=6.75': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .57,
                6: .53,
                7: .5,
                8: .49,
                9: .48,
                10: .46,
                11: .45,
                12: .44,
                13: .43,
                14: .41,
                15: .4,
                20: .35,
                25: .3,
                30: .25,
                35: .2,
                40: .2,
                45: .2,
                50: .2,
                1000: .2
            },
            '<=7': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .57,
                6: .53,
                7: .5,
                8: .48,
                9: .45,
                10: .43,
                11: .4,
                12: .38,
                13: .35,
                14: .33,
                15: .3,
                20: .28,
                25: .25,
                30: .23,
                35: .2,
                40: .2,
                45: .2,
                50: .2,
                1000: .2
            },
            '>=7.25': {
                0: .6,
                1: .6,
                2: .6,
                3: .6,
                4: .6,
                5: .57,
                6: .53,
                7: .5,
                8: .48,
                9: .45,
                10: .43,
                11: .4,
                12: .38,
                13: .35,
                14: .33,
                15: .3,
                20: .28,
                25: .25,
                30: .23,
                35: .2,
                40: .2,
                45: .2,
                50: .2,
                1000: .2
            }
        },
        '1941-1959': {
            '<=6.25': {
                0: .5,
                1: .5,
                2: .5,
                3: .5,
                4: .5,
                5: .5,
                6: .5,
                7: .5,
                8: .49,
                9: .48,
                10: .46,
                11: .45,
                12: .44,
                13: .43,
                14: .41,
                15: .40,
                20: .35,
                25: .3,
                30: .25,
                35: .2,
                40: .17,
                45: .13,
                50: .1,
                1000: .1
            },
            '<=6.5': {
                0: .5,
                1: .5,
                2: .5,
                3: .5,
                4: .5,
                5: .48,
                6: .47,
                7: .45,
                8: .44,
                9: .43,
                10: .41,
                11: .4,
                12: .39,
                13: .38,
                14: .36,
                15: .35,
                20: .3,
                25: .25,
                30: .2,
                35: .15,
                40: .13,
                45: .12,
                50: .1,
                1000: .1
            },
            '<=6.75': {
                0: .5,
                1: .5,
                2: .5,
                3: .5,
                4: .5,
                5: .47,
                6: .43,
                7: .4,
                8: .39,
                9: .38,
                10: .36,
                11: .35,
                12: .34,
                13: .33,
                14: .31,
                15: .3,
                20: .25,
                25: .2,
                30: .15,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            },
            '<=7': {
                0: .5,
                1: .5,
                2: .5,
                3: .5,
                4: .5,
                5: .47,
                6: .43,
                7: .4,
                8: .38,
                9: .36,
                10: .34,
                11: .33,
                12: .31,
                13: .29,
                14: .27,
                15: .25,
                20: .21,
                25: .18,
                30: .14,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            },
            '>=7.25': {
                0: .5,
                1: .5,
                2: .5,
                3: .5,
                4: .5,
                5: .47,
                6: .43,
                7: .4,
                8: .38,
                9: .35,
                10: .33,
                11: .3,
                12: .28,
                13: .25,
                14: .23,
                15: .2,
                20: .18,
                25: .15,
                30: .13,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            }
        },
        'pre-1941': {
            '<=6.25': {
                0: .4,
                1: .4,
                2: .4,
                3: .4,
                4: .4,
                5: .4,
                6: .4,
                7: .4,
                8: .39,
                9: .38,
                10: .36,
                11: .35,
                12: .34,
                13: .33,
                14: .31,
                15: .3,
                20: .25,
                25: .2,
                30: .15,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            },
            '<=6.5': {
                0: .4,
                1: .4,
                2: .4,
                3: .4,
                4: .4,
                5: .38,
                6: .37,
                7: .35,
                8: .34,
                9: .33,
                10: .31,
                11: .3,
                12: .29,
                13: .28,
                14: .26,
                15: .25,
                20: .21,
                25: .18,
                30: .14,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            },
            '<=6.75': {
                0: .4,
                1: .4,
                2: .4,
                3: .4,
                4: .4,
                5: .37,
                6: .33,
                7: .3,
                8: .29,
                9: .28,
                10: .26,
                11: .25,
                12: .24,
                13: .23,
                14: .21,
                15: .2,
                20: .18,
                25: .15,
                30: .13,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            },
            '<=7': {
                0: .4,
                1: .4,
                2: .4,
                3: .4,
                4: .4,
                5: .37,
                6: .33,
                7: .3,
                8: .28,
                9: .26,
                10: .24,
                11: .23,
                12: .21,
                13: .19,
                14: .17,
                15: .15,
                20: .14,
                25: .13,
                30: .11,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            },
            '>=7.25': {
                0: .4,
                1: .4,
                2: .4,
                3: .4,
                4: .4,
                5: .37,
                6: .33,
                7: .3,
                8: .28,
                9: .25,
                10: .23,
                11: .2,
                12: .18,
                13: .15,
                14: .13,
                15: .1,
                20: .1,
                25: .1,
                30: .1,
                35: .1,
                40: .1,
                45: .1,
                50: .1,
                1000: .1
            }
        }
    }
}

pref_periods = [
    0.0100,
    0.0200,
    0.0300,
    0.0500,
    0.0750,
    0.1000,
    0.1500,
    0.2000,
    0.2500,
    0.3000,
    0.3500,
    0.4000,
    0.4500,
    0.5000,
    0.5500,
    0.6000,
    0.6500,
    0.7000,
    0.7500,
    0.8000,
    0.9000,
    1.0000,
    1.1000,
    1.2000,
    1.3000,
    1.4000,
    1.5000,
    1.6000,
    1.8000,
    2.0000,
    2.2000,
    2.4000,
    2.6000,
    2.8000,
    3.0000,
    3.2000,
    3.4000,
    3.6000,
    3.8000,
    4.0000,
    4.5000,
    5.0000,
    5.5000,
    6.0000,
    6.5000,
    7.0000,
    7.5000,
    8.0000,
    9.0000,
   10.0000
]