window.onload = function(e){ 

  const getData = async () => {
    const response = await fetch('http://localhost:8888/translations')
      .catch((error) => {
          return {
              error 
          }
      });
      return await response.json();
  }

  const saveData = async (data) => {

    const response = await fetch('http://localhost:8888/translations', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(data)
      })
      .catch((error) => {
          return {
              error 
          }
      });

      return await response.json();
  }

  const addLoading = () => {
    const loading = document.createElement("div")
    loading.className = "loading-background"
    const loadingCircle = document.createElement("span")
    loadingCircle.className = "loader-span"
    loadingCircle.innerText = 'Loading...'

    loading.appendChild(loadingCircle)
    document.body.appendChild(loading)
  }

  const removeLoading = () => {
    const loading = document.querySelector(".loading-background")
    document.body.removeChild(loading)
  }

  const initTable = async () => {

    addLoading()

    const translations = await getData();

    if (!translations.error) {

        let tableData = []
        const languages = Object.keys(translations)
        let rowColumnNames = []

        languages.forEach((column) => {
            let rowKeys = Object.keys(translations[column]["translations"])
            rowColumnNames = [ ...rowColumnNames, ...rowKeys ]
        });

        rowColumnNames = rowColumnNames.reduce((newArray, item) =>{
            if (newArray.includes(item)){
                return newArray
            } else {
                return [...newArray, item]
            }
        }, [])

        rowColumnNames = rowColumnNames.map((key) => {
            return { key: key }
        })

        tableData = rowColumnNames

        let columns = [
            {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, cellClick:function(e, cell){
                cell.getRow().toggleSelect();
              }},
            {title:"key", field:"key", width:150,  editor:"input", headerFilter:"input"},
        ]

        languages.forEach(element => {
            columns.push( {title:element, field:element, width:150, editor:"input"} )
        });

        columns.forEach(column => {
            if (column.title !== "key" && !column.formatter) {
                tableData = tableData.map(row => {
                    return { ...row , ...{[column.field]: translations[column.field]["translations"][row.key]} }
                });
            }
        });

        const table = new Tabulator("#translations-table", {
            data: tableData, //assign data to table
            layout:"fitColumns", //fit columns to width of table (optional)
            columns:columns,
            maxHeight:"100%",
            tooltips:true, 
            tableBuilding:function(){
                removeLoading()
            },
            tabEndNewRow: function(row){

                console.log("row", row)
                var cells = row.getCells();
                cells[0].edit();
            }
        });

        document.getElementById("reactivity-add").addEventListener("click", function(){
            table.addRow({})
                .then((row) => {
                    const container = document.querySelector('.tabulator-tableHolder')
                    container.scrollTo(0, container.scrollHeight)

                });

        });

        document.getElementById("reactivity-remove").addEventListener("click", async function(){
            await table.getRows().forEach((row, index) => {  
               if (row.isSelected()){
                   row.delete()
               }
            });
            
        });

        document.getElementById("reactivity-save").addEventListener("click", async function(){

            const data = table.getRows()
            let result = {}

            data.forEach(rowData => {
                const row = rowData.getData()
                const param = row.key
                Object.keys(row).forEach(lng => {
                    if (lng !== "key")
                        if (result[lng] && result[lng]["translations"])
                            result[lng]["translations"] = { ...result[lng]["translations"], ...{ [param]: row[lng] } }
                        else {
                            result[lng] = {
                                translations: { [param]: row[lng] }
                            }
                        }
                    
                });
            });


            const response = await saveData(result)

            console.log(response)

            if (response.message) {
                alert(response.message)
            }
                

        });

    }

  } 

  initTable()

}