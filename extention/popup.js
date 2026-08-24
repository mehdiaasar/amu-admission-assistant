const apiBaseUrl = "http://127.0.0.1:8000";

document.getElementById("sendQuery").addEventListener("click", async () => {
  const query = document.getElementById("query").value.trim();
  const responseDiv = document.getElementById("response");
  if (!query) {
    responseDiv.textContent = "Please enter a question.";
    return;
  }
  responseDiv.textContent = "Loading...";
  try {
    const res = await fetch(`${apiBaseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    body: JSON.stringify({
      question: query,
      model: "gpt-4o-mini"
    })
    });
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const data = await res.json();
    responseDiv.textContent = data.answer || "No answer received.";
  } catch (error) {
    responseDiv.textContent = `Error: ${error.message}`;
  }
});

document.getElementById("uploadFile").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const uploadStatus = document.getElementById("uploadStatus");
  if (fileInput.files.length === 0) {
    uploadStatus.textContent = "Please select a file to upload.";
    return;
  }
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  uploadStatus.textContent = "Uploading...";
  try {
    const res = await fetch(`${apiBaseUrl}/upload-doc`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Upload failed");
    }
    const data = await res.json();
    uploadStatus.textContent = data.message || "File uploaded successfully.";
    loadDocuments();
  } catch (error) {
    uploadStatus.textContent = `Error: ${error.message}`;
  }
});

async function loadDocuments() {
  const docsList = document.getElementById("docs-list");
  docsList.innerHTML = "Loading documents...";
  try {
    const res = await fetch(`${apiBaseUrl}/list-docs`);
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const docs = await res.json();
    if (docs.length === 0) {
      docsList.textContent = "No documents found.";
      return;
    }
    docsList.innerHTML = "";
    docs.forEach(doc => {
      const div = document.createElement("div");
      div.className = "doc-item";
      div.textContent = doc.filename || "Unnamed document";
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteDocument(doc.file_id));
      div.appendChild(delBtn);
      docsList.appendChild(div);
    });
  } catch (error) {
    docsList.textContent = `Error: ${error.message}`;
  }
}

async function deleteDocument(fileId) {
  if (!confirm("Are you sure you want to delete this document?")) {
    return;
  }
  try {
    const res = await fetch(`${apiBaseUrl}/delete-doc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ file_id: fileId })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Delete failed");
    }
    const data = await res.json();
    alert(data.message || "Document deleted.");
    loadDocuments();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Load documents on popup open
document.addEventListener("DOMContentLoaded", loadDocuments);
