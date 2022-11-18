/// <reference path="jquery-1.9.1.intellisense.js" />
//Load Data in Table when documents is ready
$(document).ready(function () {
    loadData();
    
});

//Load Data function
function loadData() {
    $.ajax({
        url: "/ActivityTracking/listActivity",
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            var html = '';
            $.each(result, function (key, ac) {
                html += '<tr>';
                html += '<td>' + ac.ID + '</td>';
                html += '<td>' + ac.GuestPID + '</td>';
                html += '<td>' + ac.GuestName + '</td>';
                html += '<td>' + ac.CallRecord + '</td>';
                html += '<td>' + ac.ChatRecord + '</td>';
                html += '<td>' + ac.MeetRecord + '</td>';
                html += '<td>' + ac.CreatedDate + '</td>';
                html += '<td><a href="#" onclick="return GetbyID(' + ac.ID + ')">Edit</a></td>';
                html += '</tr>';
            });
            $('.tbody').html(html);
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

//Insert Data Function 
function Add()
{
    //var res = validate();
    //if (res == false) {
    //    return false;
    //}    
    var acObj = {
        ID: $('#ID').val(),
       UserName: $('#UserName').val(),
       GuestPID: $('#GuestPID').val(),
       GuestName: $('#GuestName').val(),
       CallRecord: $('#CallRecord').val(),
       ChatRecord: $('#ChatRecord').val(),
       MeetRecord: $('#MeetRecord').val()      
    };
    $.ajax({
        url: "/ActivityTracking/Add",
        data: JSON.stringify(acObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            loadData();
           
            $('#myModal').modal('hide');
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

//Function for getting the Data Based upon ID
function GetbyID(ID) {
    
    //$('#CasinoKiosk_UserName').css('border-color', 'lightgrey');
    //$('#isActive').css('border-color', 'lightgrey');   
    //$('#UserEmailAddress').css('border-color', 'lightgrey');
    

    $.ajax({
        url: "/ActivityTracking/GetbyID/" + ID,
        type: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (result) {
            $('#ID').val(result.ID);
            $('#GuestPID').val(result.GuestPID);
            $('#GuestName').val(result.GuestName);
            $('#CallRecord').val(result.CallRecord);
            $('#ChatRecord').val(result.ChatRecord);
            $('#MeetRecord').val(result.MeetRecord);

            $('#myModal').modal('show');
            $('#btnUpdate').show();
            $('#myModalLabel').text("Update Activity")
            $('#btnAdd').hide();
            $("#btnCheck").attr("disabled", true);
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
    return false;
}
////Function for getting the PlayerName on PID
function Check() {

    //$('#CasinoKiosk_UserName').css('border-color', 'lightgrey');
    //$('#isActive').css('border-color', 'lightgrey');   
    //$('#UserEmailAddress').css('border-color', 'lightgrey');
    //$('#GuestPID').val("test");
    
        $.ajax({
            url: "/ActivityTracking/GetNameByPID",
            type: "POST",
            data: JSON.stringify({
                PID: $("#GuestPID").val()
            }),
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function (result) {

                $('#GuestName').val(result);

                $('#myModal').modal('show');
                $('#btnAdd').show();
                $("#btnCheck").attr("disabled", false);
            },
            error: function (errormessage) {
                alert(errormessage.responseText);
            }
        });
     
    return false;
}
//function for updating player's record
function Update() {
    //var res = validate();
    //if (res == false) {
    //    return false;
    //}
    var acObj = {
        ID: $('#ID').val(),       
        GuestPID: $('#GuestPID').val(),
        GuestName: $('#GuestName').val(),
        CallRecord: $('#CallRecord').val(),
        ChatRecord: $('#ChatRecord').val(),
        MeetRecord: $('#MeetRecord').val()
    };
    //alert($('#RoleId').val());
    $.ajax({
        url: "/ActivityTracking/Update",
        data: JSON.stringify(acObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            loadData();
            
            $('#myModal').modal('hide');           
            $('#ID').val();                     
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
}

//function for deleting player's record
function Delele(ID) {
    var ans = confirm("Are you sure you want to delete this Record?");
    if (ans) {
        $.ajax({
            url: "/FOPatron/Delete/" + ID,
            type: "POST",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function (result) {
                loadData();
                
            },
            error: function (errormessage) {
                alert(errormessage.responseText);
            }
        });
    }
}

//Function for clearing the textboxes
function clearTextBox() {
    
    $('#ID').val(0);
    $('#GuestPID').val("");
    $('#GuestName').val("");
    $('#CallRecord').val("");
    $('#ChatRecord').val("");
    $('#MeetRecord').val("");

    $('#myModalLabel').text("Add New Activity")

    $('#btnUpdate').hide();
    $('#btnAdd').show();
    $("#btnCheck").attr("disabled", false);       
}
//Valdidation using jquery
function validate() {
    var isValid = true;
    //if ($('#UserID').val().trim() == "") {
    //    $('#UserID').css('border-color', 'Red');
    //    isValid = false;
    //}
    //else {
    //    $('#UserID').css('border-color', 'lightgrey');
    //}
    if ($('#FOPatron_UserName').val().trim() == "") {
        $('#FOPatron_UserName').css('border-color', 'Red');
        isValid = false;
    }
    else {
        $('#FOPatron_UserName').css('border-color', 'lightgrey');
    }
    if ($('#isActive').val().trim() == "") {
        $('#isActive').css('border-color', 'Red');
        isValid = false;
    }
    else {
        $('#isActive').css('border-color', 'lightgrey');
    }    
    return isValid;
}