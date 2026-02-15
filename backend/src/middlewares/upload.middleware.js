import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed."), false);
        }
        cb(null, true);
    },
});

const uploadDoc = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = file.mimetype.startsWith("image/") || file.mimetype === "application/pdf";
        if (!ok) return cb(new Error("Only images or PDF allowed."), false);
        cb(null, true);
    },
});

export const uploadSingle = upload.single("image");
export const uploadAadhaarSingle = uploadDoc.single("image");

// Logging middleware for upload routes - add before multer to log incoming request
export const logUploadRequest = (req, res, next) => {
    console.log("[upload] Incoming upload request - Content-Type:", req.headers["content-type"]);
    next();
};

// Accept any field name and put first file in req.uploadedFile (for aadhaar)
export const uploadAnyDoc = (req, res, next) => {
    console.log("[upload] Incoming Content-Type:", req.headers["content-type"]);
    uploadDoc.any()(req, res, (err) => {
        if (err) {
            console.error("[upload] Multer error:", err);
            return res.status(400).json({ error: err.message || "File upload failed" });
        }
        const file = (req.files && req.files[0]) || req.file;
        req.uploadedFile = file;
        if (file) console.log("[upload] File received:", file.fieldname, file.originalname, file.mimetype, file.size);
        else console.warn("[upload] No file in request. req.files:", req.files?.length, "req.file:", !!req.file);
        next();
    });
};

export default upload;
