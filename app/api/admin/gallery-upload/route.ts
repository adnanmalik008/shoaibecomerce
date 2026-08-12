import { isAuthed } from "@/lib/admin/auth";
import { ALLOWED_TYPES, MAX_BYTES, saveImage } from "@/lib/gallery-store";

// Multi-file screenshot upload from the admin gallery editor.
export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return Response.json({ error: "Session expired. Log in again." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Could not read the upload." }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "No images in the upload." }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED_TYPES[file.type]) {
      return Response.json(
        { error: `${file.name}: only WEBP, JPG, or PNG images are supported.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: `${file.name} is over 3 MB. Compress it and try again.` },
        { status: 400 }
      );
    }
    const data = Buffer.from(await file.arrayBuffer());
    try {
      urls.push(await saveImage(file.type, data));
    } catch (err) {
      console.error("gallery upload failed:", err);
      return Response.json(
        { error: "Upload failed. Check the database connection." },
        { status: 500 }
      );
    }
  }

  return Response.json({ urls });
}
