import os
import zipfile
import hashlib
import shutil

OUTPUT_ZIP = 'reliance-pay-final-cpanel.zip'
PUBLIC_ZIP = os.path.join('public', OUTPUT_ZIP)

EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    '.aistudio',
    '.cache',
    '__pycache__'
}

EXCLUDE_FILES = {
    OUTPUT_ZIP,
    'reliancepay-php-cpanel-ready.zip',
    'reliancepay-cpanel-ready.zip',
    'create_php_cpanel_zip.py',
    'build_final_cpanel_zip.py',
    'reliance_pay.db',
    'reliance_pay.db.bak'
}

def generate_checksum(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()

def build_zip():
    root_dir = os.path.abspath('.')
    print(f"Building final cPanel deployment archive: {OUTPUT_ZIP}...")

    # Ensure dist exists
    if not os.path.exists('dist') or not os.path.exists('dist/index.html'):
        print("Error: dist/index.html does not exist. Run npm run build first.")
        return

    if os.path.exists(OUTPUT_ZIP):
        os.remove(OUTPUT_ZIP)

    # Dictionary of rel_path -> src_path to package into ZIP
    files_to_pack = {}

    # 1. Walk root directory
    for current_root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f in EXCLUDE_FILES or f.endswith('.tmp') or f.endswith('.db') or f.endswith('.bak') or f.endswith('.zip'):
                continue
            full_path = os.path.join(current_root, f)
            rel_path = os.path.relpath(full_path, root_dir)

            if rel_path.startswith('public/') and rel_path.endswith('.zip'):
                continue

            # Don't add root index.html yet because we will place the compiled dist/index.html as root index.html in the ZIP
            if rel_path == 'index.html':
                continue

            files_to_pack[rel_path] = full_path

    # 2. Put compiled production index.html as root index.html inside the ZIP
    files_to_pack['index.html'] = os.path.abspath('dist/index.html')

    # 3. Ensure all dist assets are mapped into assets/
    if os.path.exists('dist/assets'):
        for f in os.listdir('dist/assets'):
            src_f = os.path.join('dist/assets', f)
            if os.path.isfile(src_f):
                files_to_pack[f'assets/{f}'] = os.path.abspath(src_f)

    # 4. Write zip archive
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for rel_path in sorted(files_to_pack.keys()):
            zipf.write(files_to_pack[rel_path], rel_path)

    file_count = len(files_to_pack)
    size_bytes = os.path.getsize(OUTPUT_ZIP)
    size_mb = size_bytes / (1024 * 1024)
    checksum = generate_checksum(OUTPUT_ZIP)

    # Copy to public folder for direct HTTP download
    os.makedirs('public', exist_ok=True)
    shutil.copy2(OUTPUT_ZIP, PUBLIC_ZIP)

    print("=" * 60)
    print("FINAL CPANEL DEPLOYMENT ZIP GENERATED SUCCESSFULLY")
    print(f"Archive Name:     {OUTPUT_ZIP}")
    print(f"Public Download:  {PUBLIC_ZIP}")
    print(f"Total Files:      {file_count}")
    print(f"File Size:        {size_mb:.2f} MB ({size_bytes:,} bytes)")
    print(f"SHA-256 Checksum: {checksum}")
    print("=" * 60)

if __name__ == '__main__':
    build_zip()
