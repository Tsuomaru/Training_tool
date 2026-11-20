import rasterio

def read_tiff(file_path):
    with rasterio.open(file_path) as image:
        return {
            "width": image.width,
            "height": image.height,
            "bands": image.count,
            "band_names": [image.tags(i + 1).get("name", f"Band {i + 1}") for i in range(image.count)],
            "data_type": image.dtypes,
            "crs": str(image.crs),
            "resolution": image.res,
            "bounds": [image.bounds.left, image.bounds.bottom, image.bounds.right, image.bounds.top]
        }
