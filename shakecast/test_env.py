from .app.orm import *
from .app.eventprocessing import *

session = Session()
shakemaps = session.query(ShakeMap).all()
impact_shakemap = session.query(ShakeMap).filter(ShakeMap.facility_shaking).all()[-1]
