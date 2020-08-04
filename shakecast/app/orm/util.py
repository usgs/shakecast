import inspect as inspect_mod

def check_testing():
    testing = False
    insp = inspect_mod.stack()
    if 'tests' in str(insp):
        testing = True
    
    return testing

###################################################

IMPACT_RANKS = [
    {'name': 'gray', 'rank': 0},
    {'name': 'green', 'rank': 100},
    {'name': 'yellow', 'rank': 200},
    {'name': 'orange', 'rank': 300},
    {'name': 'red', 'rank': 400}
]
