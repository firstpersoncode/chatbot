import { ChangeEvent, MouseEvent, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { IFile, saveFile } from "@/services/file";

export default function FileUploader({
  onSave,
}: {
  onSave: (file: IFile) => void;
}) {
  const [inputFile, setInputFile] = useState<File | undefined>(undefined);
  const [uploading, setUploading] = useState<boolean>(false);

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    setInputFile(file);
  };

  const handleSaveFile = async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!inputFile) return;
    try {
      setUploading(true);
      const file = await saveFile(inputFile);
      onSave(file);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Box
        component="label"
        htmlFor="file-uploader"
        sx={{ mb: 2, display: "block" }}
      >
        <input
          accept="application/pdf"
          id="file-uploader"
          type="file"
          style={{ display: "none" }}
          onChange={onChangeFile}
        />
        <Button variant="outlined" fullWidth component="span">
          <Typography>{inputFile ? inputFile.name : "Select File"}</Typography>
        </Button>
      </Box>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={!inputFile || uploading}
        onClick={handleSaveFile}
      >
        <Typography>Upload</Typography>
      </Button>
    </>
  );
}
