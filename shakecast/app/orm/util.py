import inspect as inspect_mod

def check_testing():
    testing = False
    insp = inspect_mod.stack()
    if 'tests' in str(insp):
        testing = True
    
    return testing

###################################################

IMPACT_RANKS = [
    {'name': 'gray', 'rank': 1},
    {'name': 'green', 'rank': 2},
    {'name': 'yellow', 'rank': 3},
    {'name': 'orange', 'rank': 4},
    {'name': 'red', 'rank': 5}
]
