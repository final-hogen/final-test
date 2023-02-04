
#Jsonをご合成しまくるツール
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
$makeFilename = "@FullJsonData.json"

function makeFile {
  param (
    $targetDirectory
  )
  Write-Host ( $targetDirectory )
  $files = Get-ChildItem -Name -Filter ($targetDirectory +"/*.json")
  $result = @{}
  foreach($file in $files)
  {
    if($file.StartsWith("@")){
      continue
    }
    $filepath = $targetDirectory+"/"+$file
    $filename = ( [System.IO.Path]::GetFileNameWithoutExtension($file) )
    $jsonData =(Get-Content $filepath | ConvertFrom-Json )
    $result.Add($filename , $jsonData)
  }
  return $result
}
function makeDirectory {
  param (
    $targetDirectory
  )
  $result = makeFile ($targetDirectory)
  
  $files = Get-ChildItem -Name -Directory $targetDirectory
  foreach($file in $files)
  {
    $dir = $targetDirectory+"/"+$file
    $retval = makeDirectory ($dir)
    $result.Add($file , $retval)
  }
  $fullJsonFilepath = $targetDirectory+"/"+$makeFilename
  # $utf8NoBom = New-Object System.Text.UTF8Encoding $false # boｍなし
  [System.IO.File]::WriteAllLines($fullJsonFilepath,(ConvertTo-Json $result -Depth 100))

  return $result
}

#実行
makeDirectory "."
