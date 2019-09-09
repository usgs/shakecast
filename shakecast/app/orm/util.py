import inspect as inspect_mod

def check_testing():
    testing = False
    insp = inspect_mod.stack()
    if 'tests' in str(insp):
        testing = True
    
    return testing

###################################################

IMPACT_RANKS = [
    {'name': 'gray', 'rank': 100},
    {'name': 'green', 'rank': 200},
    {'name': 'yellow', 'rank': 300},
    {'name': 'orange', 'rank': 400},
    {'name': 'red', 'rank': 500}
]
