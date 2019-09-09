import csv
import json
import os

from .sc_csv import generate_impact_csv

def main(group, shakemap, name):
    return generate_impact_csv(shakemap, save=True, file_name=name)
