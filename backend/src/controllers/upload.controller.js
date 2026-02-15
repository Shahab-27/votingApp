import cloudinary from "../utils/cloudinary.js";

export const uploadAadhaarDoc = async (req, res) => {
  try {
    // Support both req.file (multer.single) and req.uploadedFile (custom any() middleware)
    const file = req.uploadedFile || req.file;

    console.log("[uploadAadhaarDoc] Request received", {
      hasFile: !!file,
      hasBuffer: !!file?.buffer,
      mimetype: file?.mimetype,
      originalname: file?.originalname,
      size: file?.size,
    });

    if (!file || !file.buffer) {
      console.warn(
        "[uploadAadhaarDoc] No file provided",
        "req.file:",
        !!req.file,
        "req.files length:",
        req.files?.length
      );
      return res.status(400).json({ error: "No file provided" });
    }

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    console.log("[uploadAadhaarDoc] Uploading to Cloudinary, folder: voting-app/aadhaar");
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "voting-app/aadhaar",
    });
    console.log("[uploadAadhaarDoc] Cloudinary upload success", {
      url: result.secure_url,
      publicId: result.public_id,
    });
    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("[uploadAadhaarDoc] Upload failed:", err?.message || err);
    res.status(500).json({ error: "Aadhaar upload failed" });
  }
};
