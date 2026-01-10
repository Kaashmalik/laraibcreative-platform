import os
import glob

def fix_use_client_directive():
    files = glob.glob('**/*.js', recursive=True)
    count = 0
    
    for file in files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Check if first two lines need swapping
            if len(lines) >= 2:
                line0 = lines[0].strip()
                line1 = lines[1].strip()
                
                if 'export const dynamic' in line0 and '"use client"' in line1:
                    # Swap the lines
                    lines[0], lines[1] = lines[1], lines[0]
                    
                    with open(file, 'w', encoding='utf-8') as f:
                        f.writelines(lines)
                    
                    print(f'Fixed: {file}')
                    count += 1
        except Exception as e:
            print(f'Error processing {file}: {e}')
    
    print(f'\nTotal files fixed: {count}')

if __name__ == '__main__':
    os.chdir('d:\\Laraib Creative\\laraibcreative\\frontend\\src')
    fix_use_client_directive()
