import express, { Request, Response } from 'express';
import multer from 'multer';

const upload = multer();
const app = express();

// Load middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define upload endpoint
app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (req.file) {
    res.send(`File uploaded successfully: ${req.file.originalname}`);
  }
  else {
    res.status(400).send('No file uploaded');
  }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});