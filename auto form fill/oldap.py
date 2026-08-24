from flask import Flask, render_template, request, redirect, url_for, flash, session
# from flask_ngrok import run_wit
# h_ngrok
from PIL import Image
import io
import json
import google.generativeai as genai


app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a strong secret key

# Define the prompt for extraction
PROMPT = """
You are a highly accurate text-extraction system. You will receive the full text from two documents:
1. A 10th Marksheet
2. An Aadhaar Card

Each contains identifying information about a single individual. Your task is to parse out the following fields and return them in valid JSON. If a field does not appear or is not readable, return an empty string ("").

Required fields and JSON keys:

{
"first_name": "",
"middle_name": "",
"last_name": "",
"aadhaar_no": "",
"father_first_name": "",
"father_middle_name": "",
"father_last_name": "",
"mother_first_name": "",
"mother_middle_name": "",
"mother_last_name": "",
"mobile_no": "",
"alternate_mobile_no": "",
"date_of_birth": "",       // Format: dd-mm-yyyy
"gender": "",
"domicile_state": "",
"nationality": ""
}

Instructions:
1. **Search both documents** for each of these 16 fields.
2. When multiple sources conflict (e.g., the name appears differently on each document), choose the value from the Aadhaar Card unless that field is missing or blank there, in which case fall back to the 10th Marksheet.
3. For the date of birth, strictly format it as dd-mm-yyyy (e.g., "09-01-2004"). If unavailable in that format, leave it as an empty string.
4. If “Middle Name” is not explicitly present, leave it as an empty string.
5. Make sure the JSON object you output is valid and follows the exact structure shown above.
6. Split father's name into first, middle, and last names properly.

Now, please output only the JSON object — nothing else. Do not include any extra commentary or text.
"""

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Get API key from form
        api_key = request.form.get("api_key")
        if not api_key:
            flash("Please enter your Google API Key.", "warning")
            return redirect(url_for("index"))
        
        # Configure the generative AI API key
        genai.configure(api_key=api_key)
        
        # Validate file upload: must have two files
        if "aadhaar_file" not in request.files or "marksheet_file" not in request.files:
            flash("Please upload both Aadhaar and 10th Marksheet images.", "warning")
            return redirect(url_for("index"))
        
        aadhaar_file = request.files["aadhaar_file"]
        marksheet_file = request.files["marksheet_file"]
        
        if aadhaar_file.filename == "" or marksheet_file.filename == "":
            flash("No file selected. Please upload both required images.", "warning")
            return redirect(url_for("index"))
        
        # Open images with PIL
        try:
            aadhaar_bytes = aadhaar_file.read()
            marksheet_bytes = marksheet_file.read()
            aadhaar_image = Image.open(io.BytesIO(aadhaar_bytes))
            marksheet_image = Image.open(io.BytesIO(marksheet_bytes))
        except Exception as e:
            flash("Error processing images.", "danger")
            return redirect(url_for("index"))
        
        # Call the generative AI model
        try:
            model = genai.GenerativeModel(model_name="gemini-1.5-pro")
            response = model.generate_content([aadhaar_image, marksheet_image, PROMPT])
            extracted_text = response.text
        except Exception as e:
            flash(f"Error during extraction: {e}", "danger")
            return redirect(url_for("index"))
        
        # Try to parse the extracted text as JSON
        extracted_data = {}
        try:
            extracted_data = json.loads(extracted_text)
        except Exception as parse_err:
            # Attempt auto-repair: extract substring from first '{' to last '}'
            json_start = extracted_text.find("{")
            json_end = extracted_text.rfind("}") + 1
            if json_start != -1 and json_end != -1:
                possible_json = extracted_text[json_start:json_end]
                try:
                    extracted_data = json.loads(possible_json)
                except Exception as repair_err:
                    flash("Failed to parse extracted JSON. Please check the extraction output.", "danger")
                    return render_template("index.html", extracted_output=extracted_text)
            else:
                flash("No JSON object found in the extraction output.", "danger")
                return render_template("index.html", extracted_output=extracted_text)
        
        # Store the extracted data in the session for later use
        session["extracted_data"] = extracted_data
        return redirect(url_for("profile_form"))
    
    return render_template("index.html")

@app.route("/profile", methods=["GET", "POST"])
def profile_form():
    extracted_data = session.get("extracted_data", {})
    if request.method == "POST":
        profile_data = {
            "registered_email": request.form.get("registered_email", ""),
            "alternate_email": request.form.get("alt_email", ""),
            "first_name": request.form.get("first_name", ""),
            "middle_name": request.form.get("middle_name", ""),
            "last_name": request.form.get("last_name", ""),
            "aadhaar_no": request.form.get("aadhaar_no", ""),
            "father_first_name": request.form.get("father_first_name", ""),
            "father_middle_name": request.form.get("father_middle_name", ""),
            "father_last_name": request.form.get("father_last_name", ""),
            "mother_first_name": request.form.get("mother_first_name", ""),
            "mother_middle_name": request.form.get("mother_middle_name", ""),
            "mother_last_name": request.form.get("mother_last_name", ""),
            "mobile_no": request.form.get("mobile_no", ""),
            "alternate_mobile_no": request.form.get("alternate_mobile_no", ""),
            "date_of_birth": request.form.get("date_of_birth", ""),
            "gender": request.form.get("gender", ""),
            "domicile_state": request.form.get("domicile_state", ""),
            "nationality": request.form.get("nationality", ""),
            "religion": request.form.get("religion", ""),
            "hostel_accommodation": request.form.get("hostel_accommodation", "")
        }
        session["profile_data"] = profile_data
        return redirect(url_for("review_profile"))
    
    return render_template("profile.html", extracted=extracted_data)

@app.route("/review")
def review_profile():
    profile_data = session.get("profile_data", {})
    return render_template("review.html", profile=profile_data)

if __name__ == "__main__":
    app.run(debug=True)
