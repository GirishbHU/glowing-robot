# Batch rename all PascalCase component files to kebab-case

$renames = @{
    "ApplicationLogo.tsx" = "application-logo.tsx"
    "Checkbox.tsx" = "checkbox.tsx"
    "DangerButton.tsx" = "danger-button.tsx"
    "Dropdown.tsx" = "dropdown.tsx"
    "InputError.tsx" = "input-error.tsx"
    "InputLabel.tsx" = "input-label.tsx"
    "Modal.tsx" = "modal.tsx"
    "NavLink.tsx" = "nav-link.tsx"
    "PrimaryButton.tsx" = "primary-button.tsx"
    "ResponsiveNavLink.tsx" = "responsive-nav-link.tsx"
    "SecondaryButton.tsx" = "secondary-button.tsx"
    "TextInput.tsx" = "text-input.tsx"
}

$componentsDir = "resources\js\components"

foreach ($old in $renames.Keys) {
    $new = $renames[$old]
    $oldPath = Join-Path $componentsDir $old
    $newPath = Join-Path $componentsDir $new
    
    if (Test-Path $oldPath) {
        Write-Host "Renaming $old -> $new"
        git mv $oldPath $newPath
    } else {
        Write-Host "Skipping $old (not found)"
    }
}

Write-Host "`nAll renames complete!"
