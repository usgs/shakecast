from flask_uploads import UploadSet, IMAGES

from shakecast.app.env import USER_ASSETS_DIR, USER_TMP_DIR

xml_files = UploadSet('xmlfiles', ('xml',), default_dest=USER_TMP_DIR)
image_files = UploadSet('imagefiles', IMAGES, default_dest=USER_ASSETS_DIR)
