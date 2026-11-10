import os
import zipfile
import shutil

EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    '.aistudio',
    '.cache',
    '__pycache__'
}

EXCLUDE_FILES = {
    'reliancepay-php-cpanel-ready.zip',
    'reliancepay-cpanel-ready.zip',
    'create_php_cpanel_zip.py',
    'reliance_pay.db',
    'reliance_pay.db.bak'
}

def create_php_zip(output_filename):
    root_dir = os.path.abspath('.')
    print(f"Packaging PHP + MySQL cPanel Web Application: {output_filename}")

    # Packaging production assets
    if not os.path.exists('dist'):
        print("Running build to ensure dist files exist...")
        os.system("npm run build")

    if os.path.exists(output_filename):
        os.remove(output_filename)

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        file_count = 0
        for current_root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file in EXCLUDE_FILES or file.endswith('.tmp') or file.endswith('.db') or file.endswith('.bak'):
                    continue
                full_path = os.path.join(current_root, file)
                rel_path = os.path.relpath(full_path, root_dir)

                if rel_path == output_filename or rel_path.startswith('public/reliancepay-'):
                    continue

                zipf.write(full_path, rel_path)
                file_count += 1

    file_size_mb = os.path.getsize(output_filename) / (1024 * 1024)
    print(f"Successfully created {output_filename}: {file_count} files ({file_size_mb:.2f} MB)")

    # Copy zip to public/ so it can be served/downloaded via HTTP
    os.makedirs('public', exist_ok=True)
    public_target = os.path.join('public', output_filename)
    shutil.copy2(output_filename, public_target)
    print(f"Saved public copy to {public_target}")

if __name__ == '__main__':
    create_php_zip('reliancepay-php-cpanel-ready.zip')
