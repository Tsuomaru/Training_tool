import rasterio

def read_tiff(file_path):
    with rasterio.open(file_path) as image:
        return {
            "width": image.width,
            "height": image.height,
            "bands": image.count,
            "data_type": image.dtypes,
            "crs": str(image.crs),
            "resolution": image.res
        }