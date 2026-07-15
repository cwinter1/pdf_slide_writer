/**
 * Scale factor used to rasterize PDF pages (1 = 72dpi, the PDF native unit).
 * 2x (~144dpi) keeps annotated PowerPoint-export slides crisp on Retina
 * iPads while staying cheap enough to rasterize on the fly for every page
 * during export.
 */
export const RASTER_SCALE = 2;
