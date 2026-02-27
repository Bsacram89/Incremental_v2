### Steps 

#### Full Ingestion  

##### Setup DP_Full.DataPipeline  
1. Create workspace `Incr_Files_Demo`  
2. Create Lakehouse `LK_Lakehouse`  
3. Create Data Pipeline `DP_Full`  
4. Create activity type `Copy data` with name `CopyFilesFromBlob` 
5. In source configure Connection with `https://pezzott.blob.core.windows.net/alisonpezzott`  
6. In File path type choose `File path`  
7. In file path fill with the container `absenteeism`  
8. In Destination choose the Lakehouse `LK_Lakehouse`
9. In File path type `Landing/Files`  
10. In File format choose `DelimitedText`  
11. In File extension type .csv  
12. Save and run  

##### Setup NB_CsvToDelta.Notebook  
1. Import `NB_CsvToDelta.ipynb` 
2. Run the notebook  
3. Verify the output in the Lakehouse `LK_Lakehouse`  

##### Setup DP_Full.DataPipeline continuation  
1. Create a new activity of type `Notebook` with name `CsvToDelta` 
2. In settings fill the workspace and notebook
3. In base parameters configure Name: `is_incremental`, Type: `Bool` and Value: `false`  
4. Connect the success output from `CopyFilesFromBlob` to notebook activity  
5. Save and run the pipeline

#### Incremental Ingestion  

##### Setup DP_Incremental.DataPipeline  
1. Click on three dots in `DP_Full.DataPipeline` and click on `Save as` and fill with new name `DP_Incremental` 
2. In the new pipeline, update the `is_incremental` parameter value to `true`  
3. Create an activity of type `Get Metadata` and rename to `ListChildItems` 
4. In the setting of this activity configure `Connection` with `https://pezzott.blob.core.windows.net/alisonpezzott`  
5. In File path fill `absenteeism` 
6. In File format choose `DelimitedText` 
7. In Field list choose `Child Items` 
8. Create a new activity of type `Lookup` and rename to `GetMaxDate`  
9. In the settings choose the LK_Lakehouse
10. In the root folder select Tables
11. In table choose `MaxDate` 
12. Check the `First row only` box  
13. Create a new activity of type `Filter` and rename to `FilterFilesGreaterThanMaxDate`  
14. Connect the success outputs of activities `ListChildItems` and `GetMaxDate` to the `FilterFilesGreaterThanMaxDate` activity.  
15. In the settings, in the Items configure with dynamic content:
```
@activity('ListChildItems').output.childItems
```  
16. In the condition configure:
```
    @greater(
  substring(
    item().name,
    add(lastIndexOf(item().name, '_'), 1),
    10
  ),
  formatDateTime(activity('GetMaxDate').output.firstRow.MaxDate, 'yyyy-MM-dd')
)
```  
17. Create a new activity of type `For each` and rename to `ForEachFile` 
18. Connect the success output from `FilterFilesGreaterThanMaxDate` to the activity `ForEachFile` 
19. In the settings and items configure: 
```
@activity('FilterFilesGreaterThanMaxDate').output.Value 
```
20. Move the activity `CopyFilesFromBlob` into activity `ForEachFile` 
21. Edit settings of `CopyFilesFromBlob` in the File path, in the file name configure dynamic content:
```
@item().name
```  
22. In destination do the same and fill in File path with dynamic content:  
```
@item().name
```
23. Return to main canvas  
24. Add a new activity of type `If condition` and rename to `IfThereAreFiles`
25. Connect the success outputs of activities `FilterFilesGreaterThanMaxDate` and `ForEachFile` to the recent `IfThereAreFiles`
26. In its settings in the Activities tile, in Expression configure following dynamic content:
```
@greater(length(activity('FilterFilesGreaterThanMaxDate').output.Value), 0) 
```
27. Move the activity `CsvToDelta` into `IfThereAreFiles`
28. Save and run
