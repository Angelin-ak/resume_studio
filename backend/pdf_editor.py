import sys
import json
import re
import os
import pymupdf  # PyMuPDF
from PIL import Image, ImageDraw, ImageOps

def apply_image_styles(src_image_path, dest_image_path, size, shape, border_width, border_color_hex):
    """
    Crops, resizes, masks (for circle/rounded corners), and overlays borders
    on the profile picture, outputting a high-fidelity transparent PNG.
    """
    im = Image.open(src_image_path)
    
    # Convert palette/greyscale to RGB
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
        
    # Crop to a square (center crop)
    width, height = im.size
    min_dim = min(width, height)
    left = (width - min_dim) / 2
    top = (height - min_dim) / 2
    right = (width + min_dim) / 2
    bottom = (height + min_dim) / 2
    im = im.crop((left, top, right, bottom))
    
    # Resize to the final size
    im = im.resize((size, size), Image.Resampling.LANCZOS)
    
    # Create mask for transparency
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw shape mask
    if shape == "circle":
        draw.ellipse((0, 0, size, size), fill=255)
    elif shape == "rounded-square" or shape == "squircle":
        r = int(size * 0.12) if shape == "rounded-square" else int(size * 0.25)
        draw.rounded_rectangle((0, 0, size, size), radius=r, fill=255)
    else:  # square
        draw.rectangle((0, 0, size, size), fill=255)
        
    # Apply mask
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(im, (0, 0), mask=mask)
    
    # Draw border outline
    if border_width > 0:
        # Parse hex color
        try:
            hex_color = border_color_hex.lstrip('#')
            if len(hex_color) == 3:
                hex_color = ''.join(c*2 for c in hex_color)
            border_color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4)) + (255,)
        except Exception:
            border_color = (255, 255, 255, 255)
            
        draw_rgba = ImageDraw.Draw(output)
        
        # Shift border inside page boundaries to avoid edge clipping
        offset = border_width / 2.0
        x0 = offset
        y0 = offset
        x1 = size - offset
        y1 = size - offset
        
        if shape == "circle":
            draw_rgba.ellipse((x0, y0, x1, y1), outline=border_color, width=border_width)
        elif shape == "rounded-square" or shape == "squircle":
            r = int(size * 0.12) if shape == "rounded-square" else int(size * 0.25)
            r_adj = max(0, r - int(offset))
            draw_rgba.rounded_rectangle((x0, y0, x1, y1), radius=r_adj, outline=border_color, width=border_width)
        else: # square
            draw_rgba.rectangle((x0, y0, x1, y1), outline=border_color, width=border_width)
            
    output.save(dest_image_path, "PNG")

def extract_pdf_info(pdf_path):
    """
    Extracts text blocks and structural spans from the PDF.
    Also attempts to guess key fields (name, email, phone, location) 
    based on fonts and patterns.
    Renders pages to PNG images and returns page dimensions.
    """
    doc = pymupdf.open(pdf_path)
    text_content = ""
    all_spans = []
    
    # Simple regexes
    email_regex = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
    phone_regex = re.compile(r'(\+?\d{1,3}[-.\s]??\d{3}[-.\s]??\d{3,4}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{3}[-.\s]??\d{4})')
    url_regex = re.compile(r'(https?://\S+|www\.\S+|linkedin\.com/\S+|github\.com/\S+)')

    candidates = {
        "name": "",
        "email": "",
        "phone": "",
        "url": "",
        "location": ""
    }
    
    max_font_size = 0
    guessed_name = ""
    
    pages_info = []
    pdf_name = os.path.basename(pdf_path)

    # 1. Extract spans and metadata from all pages
    for page_idx, page in enumerate(doc):
        # Extract plain text
        text_content += page.get_text()
        
        # Get structured layout dict
        page_dict = page.get_text("dict")
        for block in page_dict["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text:
                            continue
                            
                        span_info = {
                            "text": text,
                            "bbox": span["bbox"],
                            "font": span["font"],
                            "size": span["size"],
                            "color": span["color"],
                            "page": page_idx
                        }
                        all_spans.append(span_info)
                        
                        # Guess Name: Largest font size on first page
                        if page_idx == 0 and span["size"] > max_font_size:
                            # Skip strings that are likely not names (e.g. page headers or digits)
                            if len(text) > 2 and not text.isdigit() and not any(kw in text.lower() for kw in ["resume", "cv", "curriculum"]):
                                max_font_size = span["size"]
                                guessed_name = text

    # 2. Apply in-memory textless redactions and render page images
    for page_idx, page in enumerate(doc):
        page_spans = [s for s in all_spans if s["page"] == page_idx]
        for s in page_spans:
            try:
                page.add_redact_annot(pymupdf.Rect(s["bbox"]), fill=None)
            except Exception as e:
                pass
        try:
            page.apply_redactions()
        except Exception as e:
            sys.stderr.write(f"Error applying redactions on page {page_idx}: {str(e)}\n")

        page_img_name = f"page-{page_idx}-{pdf_name}.png"
        page_img_path = os.path.join(os.path.dirname(pdf_path), page_img_name)
        try:
            pix = page.get_pixmap(dpi=150)
            pix.save(page_img_path)
        except Exception as e:
            sys.stderr.write(f"Error rendering page {page_idx}: {str(e)}\n")
            
        pages_info.append({
            "page": page_idx,
            "width": page.rect.width,
            "height": page.rect.height,
            "image": page_img_name
        })

    # Extract clean candidates using regex on spans
    for span in all_spans:
        text = span["text"]
        
        # Email check
        if not candidates["email"]:
            email_match = email_regex.search(text)
            if email_match:
                candidates["email"] = email_match.group(0)
                
        # Phone check
        if not candidates["phone"]:
            phone_match = phone_regex.search(text)
            if phone_match:
                candidates["phone"] = phone_match.group(0)
                
        # Url check
        if not candidates["url"]:
            url_match = url_regex.search(text)
            if url_match:
                candidates["url"] = url_match.group(0)

    # Set guessed name
    candidates["name"] = guessed_name
    
    # Structure unique spans for frontend mapping list
    unique_texts = []
    seen = set()
    for s in all_spans:
        txt = s["text"]
        if len(txt) > 1 and txt not in seen:
            seen.add(txt)
            unique_texts.append({
                "text": txt,
                "size": s["size"],
                "font": s["font"]
            })
            
    # Sort texts by font size descending
    unique_texts.sort(key=lambda x: x["size"], reverse=True)

    result = {
        "text": text_content,
        "candidates": candidates,
        "unique_texts": unique_texts[:150], # Top 150 unique text elements
        "pages": pages_info,
        "all_spans": all_spans
    }
    
    return result

def get_font_alias(font_name):
    """
    Maps original font name to one of standard PDF core fonts supported in PyMuPDF.
    """
    fn = font_name.lower()
    is_bold = "bold" in fn or "black" in fn or "heavy" in fn
    is_italic = "italic" in fn or "oblique" in fn
    
    if "times" in fn or "serif" in fn or "georgia" in fn:
        if is_bold and is_italic:
            return "tibi"
        elif is_bold:
            return "tibo"
        elif is_italic:
            return "tiit"
        else:
            return "tiro"
    elif "courier" in fn or "mono" in fn or "code" in fn:
        if is_bold and is_italic:
            return "cobi"
        elif is_bold:
            return "cobo"
        elif is_italic:
            return "coob"
        else:
            return "cour"
    else:  # Helvetica / Sans-Serif default
        if is_bold and is_italic:
            return "hebi"
        elif is_bold:
            return "hebo"
        elif is_italic:
            return "heob"
        else:
            return "helv"

def replace_pdf_text(input_path, output_path, replacements, image_info=None):
    """
    Replacements is a dict: { "Old text": "New text" }
    For each replacement, we search the PDF, find the exact font styles,
    redact the coordinates, and draw the new text overlay.
    If image_info is provided, it processes and overlays the profile photo as well.
    """
    doc = pymupdf.open(input_path)
    
    for page_idx, page in enumerate(doc):
        # Extract page spans first to look up styles
        spans = []
        page_dict = page.get_text("dict")
        for block in page_dict["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        spans.append(span)

        # Collect insertions to perform after applying all page redactions
        insertions = []

        # Apply replacements
        for old_txt, new_txt in replacements.items():
            if not old_txt.strip():
                continue
                
            if new_txt is None:
                new_txt = ""
                
            # Find coordinates of old text
            instances = page.search_for(old_txt)
            for inst in instances:
                # Find matching span for styling details
                font_name = "helv"
                font_size = 10
                color_rgb = (0, 0, 0)
                
                best_span = None
                max_overlap = 0
                for span in spans:
                    span_rect = pymupdf.Rect(span["bbox"])
                    overlap = span_rect.intersect(inst).get_area()
                    if overlap > max_overlap:
                        max_overlap = overlap
                        best_span = span
                        
                if best_span:
                    font_size = best_span["size"]
                    font_name = get_font_alias(best_span["font"])
                    c = best_span["color"]
                    # Extract RGB from 24-bit int
                    r = ((c >> 16) & 255) / 255.0
                    g = ((c >> 8) & 255) / 255.0
                    b = (c & 255) / 255.0
                    color_rgb = (r, g, b)
                
                # Add redaction annotation (delayed application)
                page.add_redact_annot(inst, fill=None)
                
                # Write new text exactly in the original bounding box if not empty
                if new_txt.strip():
                    # Align text using insert_textbox. Expand the frame dynamically
                    # based on line breaks and length safety margin to prevent clipping
                    lines = new_txt.split('\n')
                    num_lines = len(lines)
                    rect_height = inst.y1 - inst.y0
                    
                    # Estimate additional wrapping lines for long text
                    char_limit = max(10, int((inst.x1 - inst.x0) / (max(2, font_size) * 0.5)))
                    estimated_wrap_lines = max(1, int(len(new_txt) / char_limit))
                    effective_lines = max(num_lines, estimated_wrap_lines)
                    
                    # Expand width safety margin by 150px so text doesn't wrap aggressively
                    # Expand height downwards based on the number of lines
                    expanded_rect = pymupdf.Rect(
                        inst.x0,
                        inst.y0 - (inst.height * 0.05), # minor upward adjustment
                        inst.x1 + 150, # generous width safety margin
                        inst.y0 + (rect_height * max(1.2, effective_lines))
                    )
                    
                    insertions.append({
                        "rect": expanded_rect,
                        "text": new_txt,
                        "fontsize": font_size,
                        "fontname": font_name,
                        "color": color_rgb
                    })

        # Apply all page redactions at once
        page.apply_redactions()

        # Perform all text overlay insertions
        for ins in insertions:
            page.insert_textbox(
                ins["rect"],
                ins["text"],
                fontsize=ins["fontsize"],
                fontname=ins["fontname"],
                color=ins["color"]
            )

    # Apply image if provided
    if image_info and image_info.get("path"):
        img_path = image_info["path"]
        if os.path.exists(img_path):
            temp_styled_path = img_path + "_styled.png"
            try:
                apply_image_styles(
                    src_image_path=img_path,
                    dest_image_path=temp_styled_path,
                    size=image_info.get("size", 96),
                    shape=image_info.get("shape", "circle"),
                    border_width=image_info.get("border_width", 2),
                    border_color_hex=image_info.get("border_color", "#ffffff")
                )
                
                page_idx = image_info.get("page", 0)
                if page_idx < len(doc):
                    page = doc[page_idx]
                    x = image_info.get("x", 50)
                    y = image_info.get("y", 50)
                    size = image_info.get("size", 96)
                    
                    # Insert styled image
                    rect = pymupdf.Rect(x, y, x + size, y + size)
                    page.insert_image(rect, filename=temp_styled_path)
            except Exception as img_err:
                sys.stderr.write(f"Error drawing profile image: {str(img_err)}\n")
            finally:
                if os.path.exists(temp_styled_path):
                    try:
                        os.remove(temp_styled_path)
                    except Exception:
                        pass

    doc.save(output_path)
    doc.close()
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python pdf_editor.py <mode> <arguments...>")
        sys.exit(1)
        
    mode = sys.argv[1]
    
    if mode == "extract":
        pdf_file = sys.argv[2]
        try:
            info = extract_pdf_info(pdf_file)
            print(json.dumps(info, indent=2))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
            
    elif mode == "replace":
        if len(sys.argv) < 5:
            print("Usage: python pdf_editor.py replace <input_pdf> <output_pdf> <replacements_json_path>")
            sys.exit(1)
            
        input_pdf = sys.argv[2]
        output_pdf = sys.argv[3]
        replacements_json_path = sys.argv[4]
        
        try:
            with open(replacements_json_path, 'r', encoding='utf-8') as f:
                payload = json.load(f)
                
            if isinstance(payload, dict) and "replacements" in payload:
                replacements = payload["replacements"]
                image_info = payload.get("image")
            else:
                replacements = payload
                image_info = None
                
            success = replace_pdf_text(input_pdf, output_pdf, replacements, image_info)
            print(json.dumps({"success": success, "output": output_pdf}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
            
    elif mode == "render":
        if len(sys.argv) < 3:
            print("Usage: python pdf_editor.py render <pdf_path>")
            sys.exit(1)
        pdf_path = sys.argv[2]
        try:
            doc = pymupdf.open(pdf_path)
            pdf_name = os.path.basename(pdf_path)
            pages = []
            for page_idx, page in enumerate(doc):
                # Redact all text blocks to render a textless page background
                page_dict = page.get_text("dict")
                for block in page_dict["blocks"]:
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                text = span["text"].strip()
                                if text:
                                    try:
                                        page.add_redact_annot(pymupdf.Rect(span["bbox"]), fill=None)
                                    except Exception:
                                        pass
                try:
                    page.apply_redactions()
                except Exception:
                    pass

                page_img_name = f"page-{page_idx}-{pdf_name}.png"
                page_img_path = os.path.join(os.path.dirname(pdf_path), page_img_name)
                pix = page.get_pixmap(dpi=150)
                pix.save(page_img_path)
                pages.append({
                    "page": page_idx,
                    "width": page.rect.width,
                    "height": page.rect.height,
                    "image": page_img_name
                })
            doc.close()
            print(json.dumps({"success": True, "pages": pages}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
            
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)
