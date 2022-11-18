$(document).ready(function () {
    //Area Manager in card
    displayManagerInfo(false);
    $('#btnSubmitDlg').hide();

    // Area employee for enter text
    $("#selfComment").Editor();
    $("#staffPerComment").Editor();
    $("#staffComment").Editor();
    $("#staffGoalsComment").Editor();

    // Area employee for read 
    $("#selfCommentMana").Editor();
    $("#staffPerCommentMana").Editor();
    $("#staffCommentMana").Editor();
    $("#staffGoalsCommentMana").Editor();
    $("#managerComment").Editor();
    $("#managerPerComment").Editor();
    getInitData();
    $(".name-signature").focusout(function () {
        $(".name-signature").css("border", "none");
        $(".name-signature").css("background", "#dae6f3");
    });


    $(function () {
        $("[data-toggle=popover]").popover({
            html: true,
            content: function () {
                var content = $(this).attr("data-popover-content");
                return $(content).children(".popover-body").html();
            },
            title: function () {
                var title = $(this).attr("data-popover-content");
                return $(title).children(".popover-heading").html();
            }
        });
    });
});

function getInitData() {
    $.ajax({
        type: 'GET',
        url: '/Employee/getInitData',
        catche: false,
        data: {
            id: $("#employeeNo").val(),
            managerId: $("#manaId").val()
        },
        dataType: "json",
        success: function (data) {

            //display User loggin
            $("#imgEmpLoggin").attr("src", data.empData.EmployeeImage);
            

            //display all Manager Name
            if (data.managerModel.EmployeeID) {
               
                displayManagerInfo(true);
                $('#manaId').val(data.managerModel.EmployeeID);
                $('#manaName').html(data.managerModel.FullName);
                $('#manaPos').html(data.managerModel.Position);
               
            } else {
                displayManagerInfo(false);
            }

            //display Department Name
            $('#departName').html(data.infoOther.departName);

            //display Signature
            $('#empSign').val(data.revDetail.Signature == null ? (data.empData.FullName + "").toLowerCase() : data.revDetail.Signature);

            //display Self Review
            if (+data.infoOther.isManager) {
                $('#btnEmpList').show();
                if (+data.infoOther.level >= 6) {
                    $('#staffSelfArea').hide();
                    $('#staffPerArea').hide();
                    $('#staffComtArea').hide();
                    $('#staffGoalsArea').hide();
                    $('#empContain').hide();
                    $('#btnSubmit').hide();
                }
            } else {
                $('#btnEmpList').hide();
            }

            loadDataSubmit(data.infoOther.isSubmited);
            
            // Team member comments
            if (data.infoOther.isSubmited) {
                $('#staffComtArea .Editor-editor').attr('contenteditable', false);
            } else {
                if (data.infoOther.isReviewed) {
                    $('#staffComtArea .Editor-editor').attr('contenteditable', true);
                } else {
                    $('#staffComtArea .Editor-editor').attr('contenteditable', false);
                }
            }

            //display button submit
            if (!data.infoOther.isSaved) {
                $('#btnSubmit').hide();
            }

            // button Manager assessment 
            if (data.infoOther.isReviewed) {
                $('#btnManaRev').prop('disabled', false);
                $('#contManaRev').css('pointer-events', 'auto');
            } else {
                $('#btnManaRev').prop('disabled', true);
                $('#contManaRev').css('pointer-events', 'none')
            }

            html = ``;
            $('#tblEmployee').DataTable().destroy();
            catche: false,
            $.each(data.empList, function (key, info) {
                html += `<tr>`;
                html += `<td class="align-middle">` + info.StaffEID + `</td>`;
                html += `<td class="align-middle">` + info.FullName + `</td>`;

                html += `<td class="align-middle">` + info.Position + `</td>`;
                html += `<td class="text-center align-middle">`
                html += `    <div class="btn-group">`;
                html += `       <button class="btn btn-outline-success" OnClick="detailEmployee('` + info.StaffEID + `')">Detail</button>`;
                html += `    </div>`;
                html += `    <div class="btn-group">`;
                html += `       <button class="btn btn-outline-danger" data-toggle="modal" data-target="#deleteModalDg"  OnClick="confirmDelete('` + info.StaffEID + `')">Delete</button>`;
                html += `    </div>`;
                html += `    <div class="btn-group">`;
                html += `       <button class="btn btn-outline-primary" data-toggle="modal" data-target="#editorModalDg" OnClick="showEditor('` + info.StaffEID + `')">Editor</button>`;
                html += `    </div>`;
                html += `    <input type="hidden" value="` + info.EmployeeImage + `" id="img` + info.StaffEID + `"/>`;
                html += `    <input type="hidden" value="` + info.StaffEID + `" id="eid` + info.StaffEID + `"/>`;
                html += `    <input type="hidden" value="` + info.FullName + `" id="name` + info.StaffEID + `"/>`;
                html += `    <input type="hidden" value="` + info.Position + `" id="pos` + info.StaffEID + `"/>`;
                html += `    <input type="hidden" value="` + info.Department + `" id="dep` + info.StaffEID + `"/>`;
                html += `</td></tr>`;


            });
            $('#tblReviewer').html(html);
            $('#tblEmployee').DataTable({
                "bDestroy": true,
                "order": [[0, "desc"]]
            });
            

            //display Manager Review
            if (data.revDetail) {
                if (data.infoOther.isReviewed) {
                    $('#manaRev').html('Reviewed');
                }
                displayStaffReview(data.revDetail);

            } else {
               // viewEmployee();

            }

        }
    });
}

function openReviewed() {
    let empId = $("#empId").text();
    $.ajax({
        type: 'POST',
        url: '/Employee/openReviewed',
        catche: false,
        data: {
            empId: empId
        },
        dataType: "json",
        success: function (result) {
            clearRadio();
            $('#managerModal').modal('show');
            $('#EmpManaArea').hide();
            $('#StaffContainer').hide();
            $('#btnSaveDlg').hide();
            $('#btnSubmitDlg').hide();
            displayTextEditor('#managerArea .Editor-editor', decodeURIComponent(result.ManagerAssessment == null ? '' : result.ManagerAssessment), true);
            displayTextEditor('#managerPerArea .Editor-editor', decodeURIComponent(result.ManagerPerformanceSummary == null ? '' : result.ManagerPerformanceSummary), true);
            showRadio(result.Criteria1, "rdJobKnow");
            showRadio(result.Criteria2, "rdPassion");
            showRadio(result.Criteria3, "rdCreate");
            showRadio(result.Criteria4, "rdProfession");
            showRadio(result.Criteria5, "rdUniform");
            showRadio(result.Criteria6, "rdEthic");
            showRadio(result.Criteria7, "rdInteg");
            showRadio(result.Criteria8, "rdCommu");
            showRadio(result.Criteria9, "rdBodyLanguage");
            showRadio(result.Criteria10, "rdWork");
            showRadio(result.Criteria11, "rdRelation");

            $('#manaAreaComt').css("pointer-events", "none");
            $('#manaSign').val(result.ManagerSignature);
            $('#signDateM').html(convertDateFromCsToJs(result.UpdatedTime));
            $('#statusReviewContain').hide();
           // $('#btnSave').hide();
        }
    });
}


function detailEmployee(empId) {
    let imgId = "#img" + empId;
    $.ajax({
        type: 'POST',
        url: '/Employee/getDetailEmp',
        catche: false,
        data: {
            empId: empId
        },
        success: function (data) {
           
            if (data) {
                clearRadio();
                $('.Editor-editor').html('');

                $('#empEID').val(data.EmployeeID);
                $("#imgDetail").attr("src", data.Img);
                $('#eidDetail').html(data.EmployeeID);
                $('#nameDetail').html(data.FullName);
                $('#posDetail').html(data.Position);
                $('#deptDetail').html(data.DepartmentName);

                if (+data.LevelName < 3) {
                    $('#staffSelfAreaMana').hide();
                    $('#staffPerAreaMana').hide();
                    $('#staffGoalsAreaMana').hide();
                    $('#StaffContainer').show();
                    $('#EmployeeContainer').hide();
                } else {
                    $('#staffSelfAreaMana').show();
                    $('#staffPerAreaMana').show();
                    $('#staffGoalsAreaMana').show();
                    displayTextEditor('#staffSelfAreaMana .Editor-editor', decodeURIComponent(data.SelfEvaluation == null ? '' : data.SelfEvaluation), false);
                    displayTextEditor('#staffPerAreaMana .Editor-editor', decodeURIComponent(data.StaffPerformanceSummary == null ? '' : data.StaffPerformanceSummary), false);
                    displayTextEditor('#staffGoalsAreaMana .Editor-editor', decodeURIComponent(data.StaffGoals == null ? '' : data.StaffGoals), false);
                    $('#StaffContainer').hide();
                    $('#EmployeeContainer').show();
                }

                if (+$('#level').val() >= 6) {
                    $('#btnSubmitDlg').show();
                }

                if (data.isReviewed) {
                    $('#chbStatusReview').prop('checked', true);
                } else {
                    $('#chbStatusReview').prop('checked', false);
                }

                displayTextEditor('#staffComtAreaMana .Editor-editor', decodeURIComponent(data.StaffComments == null ? '' : data.StaffComments), false);
                displayTextEditor('#managerArea .Editor-editor', decodeURIComponent(data.ManagerAssessment == null ? '' : data.ManagerAssessment), true);
                displayTextEditor('#managerPerArea .Editor-editor', decodeURIComponent(data.ManagerPerformanceSummary == null ? '' : data.ManagerPerformanceSummary), true);
                $('#manaAreaComt').css("pointer-events", "auto");

                showRadio(data.Criteria1, "rdJobKnow");
                showRadio(data.Criteria2, "rdPassion");
                showRadio(data.Criteria3, "rdCreate");
                showRadio(data.Criteria4, "rdProfession");
                showRadio(data.Criteria5, "rdUniform");
                showRadio(data.Criteria6, "rdEthic");
                showRadio(data.Criteria7, "rdInteg");
                showRadio(data.Criteria8, "rdCommu");
                showRadio(data.Criteria9, "rdBodyLanguage");
                showRadio(data.Criteria10, "rdWork");
                showRadio(data.Criteria11, "rdRelation");
                showRadio(data.Criteria12, "rdJobKnowS");
                showRadio(data.Criteria13, "rdTeamPlayer");
                showRadio(data.Criteria14, "rdProfessionS");
                showRadio(data.Criteria15, "rdDependa");
                displayStaffReview(data);

                $('#signDateM').html(convertDateFromCsToJs(data.signDateM));
                $('#manaSign').val(data.ManagerSignature == null ? $("#employeeName").val().toLowerCase() : data.ManagerSignature);
                $('#managerModal').modal('show');

            }
        }
    });
}


function convertDateFromCsToJs(value) {
    if (value) {
        var pattern = /Date\(([^)]+)\)/;
        var results = pattern.exec(value);
        var dt = new Date(parseFloat(results[1]));
        return dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
    } else {
        var date = new Date();
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }
    
}

function getTextAll(id) {
    var spans = document.querySelectorAll(id);
    let str = '';

    for (var i = 0, l = spans.length; i < l; i++) {
        str += spans[i].textContent || spans[i].innerText + " ";
    }
    return str
}


function saveStaffReview(isSubmit) {
    let countErr = 0;

    if ($('#manaName').html() == '') {
        $("#checkManagerName").html("*Please select your Manager!");
        countErr++;
    }


    if ($('#staffSelfArea div[contenteditable="true"]').html() != undefined) {
        if ($('#staffSelfArea div[contenteditable="true"]').html().length < 120) {
            $('#checkSelfComment').html('Enter at least 120 character');
            countErr++;
        }
    }

    if ($('#staffPerArea div[contenteditable="true"]').html() != undefined) {
        if ($('#staffPerArea div[contenteditable="true"]').html().length < 120) {
            $('#checkStaffPerComment').html('Enter at least 120 character');
            countErr++;
        }

    }

    if ($('#staffComtArea div[contenteditable="true"]').html() != undefined) {
        if ($('#staffComtArea div[contenteditable="true"]').html().length < 120) {
            $('#checkStaffComment').html('Enter at least 120 character');
            countErr++;
        }
    }

    if ($('#staffGoalsArea div[contenteditable="true"]').html() != undefined) {
        if ($('#staffGoalsArea div[contenteditable="true"]').html().length < 120) {
            $('#checkStaffGoalsComment').html('Enter at least 120 character');
            countErr++;
        }
    }

    if ($('#empSign').val() == "") {
        $('#checkEmpSign').html('Enter your signature');
        countErr++;
    }


    if (countErr == 0) {
        $.ajax({
            type: 'POST',
            url: '/Employee/saveStaffReview',
            catche: false,
            data: {
                
                EmployeeID: $("#empId").text(),
                SelfEvaluation: encodeURIComponent($('#staffSelfArea .Editor-editor').html()),
                StaffPerformanceSummary: encodeURIComponent($('#staffPerArea .Editor-editor').html()),
                StaffGoals: encodeURIComponent($('#staffGoalsArea .Editor-editor').html()),
                StaffComments: encodeURIComponent($('#staffComtArea .Editor-editor').html()),
                ManagerId: $('#manaId').val(),
                empSign: $('#empSign').val(),
                isSubmit: isSubmit
            },
            dataType: "json",
            success: function (data) {
                
                $('#checkSelfComment').html('');
                $('#checkStaffPerComment').html('');
                $('#checkStaffComment').html('');
                $('#checkStaffGoalsComment').html('');
                $('#checkEmpSign').html('');
                $('#btnSubmit').show();
                if (data.isReviewed) {
                    $('#staffComtArea .Editor-editor').attr('contenteditable', true);
                } else {
                    $('#staffComtArea .Editor-editor').attr('contenteditable', false);
                }
                
                if (isSubmit) {
                    loadDataSubmit(true);
                }
                $('#submitSuccessModal').modal('show');
                
            }
        })
    }

}

function changeManager() {
    $.ajax({
        type: 'GET',
        url: '/Employee/getManagerInfo',
        catche: false,
        data: {
            id: $('#empId').html(),
            manaId: $('#manaId').val(),
        },
        dataType: "json",
        success: function (data) {
            if (data.FullName) {
                $("#checkManagerName").html('');
                $("#manaSign").val((data.FullName + "").toLowerCase())

                displayManagerInfo(true);
                $("#manaName").html(data.FullName);
                $("#manaPos").html(data.Position);
              
            } else {
                displayManagerInfo(false);
                $("#checkManagerName").html("Manager ID is not correct !!");
            }
        }
    });
}

function displayManagerInfo(isShow) {
    $("#manaName").html('');
    $("#manaPos").html('');
    if (isShow) {
        $("#manaName").show();
        $("#manaNameLb").show();
        $("#manaPos").show();
        $("#manaPosLb").show();
    } else {
        $("#manaName").hide();
        $("#manaNameLb").hide();
        $("#manaPos").hide();
        $("#manaPosLb").hide();
    }
}

function showRadio(criteria, name) {
    $('#' + name + criteria).click();
}
function clearRadio() {
    $(`input[name=rdJobKnow]`).attr('checked', false);
    $(`input[name=rdPassion]`).attr('checked', false);
    $(`input[name=rdCreate]`).attr('checked', false);
    $(`input[name=rdProfession]`).attr('checked', false);
    $(`input[name=rdUniform]`).attr('checked', false);
    $(`input[name=rdEthic]`).attr('checked', false);
    $(`input[name=rdInteg]`).attr('checked', false);
    $(`input[name=rdCommu]`).attr('checked', false);
    $(`input[name=rdBodyLanguage]`).attr('checked', false);
    $(`input[name=rdWork]`).attr('checked', false);
    $(`input[name=rdRelation]`).attr('checked', false);
    $(`input[name=rdJobKnowS]`).attr('checked', false);
    $(`input[name=rdTeamPlayer]`).attr('checked', false);
    $(`input[name=rdProfessionS]`).attr('checked', false);
    $(`input[name=rdDependa]`).attr('checked', false);
}

function displayStaffReview(revDetail) {
    $('#staffSelfArea .Editor-editor').html(revDetail.SelfEvaluation == null ? '' : decodeURIComponent(revDetail.SelfEvaluation));
    $('#staffPerArea .Editor-editor').html(revDetail.StaffPerformanceSummary == null ? '' : decodeURIComponent(revDetail.StaffPerformanceSummary));
    $('#staffGoalsArea .Editor-editor').html(revDetail.StaffGoals == null ? '' : decodeURIComponent(revDetail.StaffGoals));
    $('#staffComtArea .Editor-editor').html(revDetail.StaffComments == null ? '' : decodeURIComponent(revDetail.StaffComments));
    $('#signDate').html(convertDateFromCsToJs(revDetail.UpdatedTime));
}

//Delete Employee
function confirmDelete(empId) {
    $("#employeeEIDDel").val(empId);
    $('#deleteModalDg').modal('show');
}

function showEditor(empId) {
    $('#tblEditor').DataTable().destroy();
    $.ajax({
        type: 'GET',
        url: '/Employee/getLogData',
        catche: false,
        data: {
            empid: empId
        },
        dataType: "json",
        success: function (data) {
            let html = ``;
            $.each(data, function (key, info) {
                html += `<tr>`;
                html += `<td class="align-middle">` + info.FullName + `</td>`;

                html += `<td class="align-middle">` + info.UpdatedTime + `</td>`;
                html += `</td></tr>`;


            });
            $('#bodyEditor').html(html);
        }
    });
}

function deleteSubmit() {
    $.ajax({
        type: 'POST',
        url: '/Employee/delEmployee',
        catche: false,
        data: {
            id: $("#employeeEIDDel").val()
        },
        dataType: "json",
        success: function (data) {
            getInitData();
        }
    });
}

function displayTextEditor(name, value, status) {
    $(name).html(value);
    $(name).attr('contenteditable', status);
}

function changeSubmit(){
    $.ajax({
        type: 'POST',
        url: '/Employee/changeSubmit',
        catche: false,
        data: {
            EmployeeID: $('#empEID').val()
        },
        success: function (data) {
            $('#submitSuccessModal').modal('show');
        }
    });
}

function saveReview() {
    let countErr = 0;
    if ($('#managerArea div[contenteditable="true"]').html() != undefined) {
        if ($('#managerArea div[contenteditable="true"]').html().length < 120) {
            $('#checkManagerComment').html('Enter at least 120 character');
            countErr++;
        }
    }

    if ($('#managerPerArea div[contenteditable="true"]').html() != undefined) {
        if ($('#managerPerArea div[contenteditable="true"]').html().length < 120) {
            $('#checkManagerPerComment').html('Enter at least 120 character');
            countErr++;
        }
    }

    if ($('#manaSign').val() == "") {
        $('#checkManaSign').html('Enter your signature');
        countErr++;
    }
 
    if (countErr == 0) {
        $.ajax({
            type: 'POST',
            url: '/Employee/saveReview',
            catche: false,
            data: {
                EmployeeID: $('#empEID').val(),
                ManagerAssessment: encodeURIComponent($('#managerArea .Editor-editor').html()),
                ManagerPerformanceSummary: encodeURIComponent($('#managerPerArea .Editor-editor').html()),
                Criteria1: $("input[type='radio'][name='rdJobKnow']:checked").val(),
                Criteria2: $("input[type='radio'][name='rdPassion']:checked").val(),
                Criteria3: $("input[type='radio'][name='rdCreate']:checked").val(),
                Criteria4: $("input[type='radio'][name='rdProfession']:checked").val(),
                Criteria5: $("input[type='radio'][name='rdUniform']:checked").val(),
                Criteria6: $("input[type='radio'][name='rdEthic']:checked").val(),
                Criteria7: $("input[type='radio'][name='rdInteg']:checked").val(),
                Criteria8: $("input[type='radio'][name='rdCommu']:checked").val(),
                Criteria9: $("input[type='radio'][name='rdBodyLanguage']:checked").val(),
                Criteria10: $("input[type='radio'][name='rdWork']:checked").val(),
                Criteria11: $("input[type='radio'][name='rdRelation']:checked").val(),
                Criteria12: $("input[type='radio'][name='rdJobKnowS']:checked").val(),
                Criteria13: $("input[type='radio'][name='rdTeamPlayer']:checked").val(),
                Criteria14: $("input[type='radio'][name='rdProfessionS']:checked").val(),
                Criteria15: $("input[type='radio'][name='rdDependa']:checked").val(),
                ManagerSignature: $('#manaSign').val(),

            },
            success: function (data) {
                $('#checkManaSign').html('');
                $('#checkManagerComment').html('');
                $('#checkManagerPerComment').html('');
                $('#submitSuccessModal').modal('show');
            }
        });
    }

}

function updStatusReview() {
    let empId = $('#eidDetail').html();

    let mode;
    if ($('#chbStatusReview').is(':checked')) {
        mode = "on"
    } else {
        mode = "off"
    }

    $.ajax({
        type: 'POST',
        url: '/Employee/updStatusReview',
        catche: false,
        data: {
            mode: mode,
            empID: empId,
            manaEID: $("#employeeNo").val()
        },
        success: function (data) {
            var date = new Date();
            var current_date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            $('#signDateM').html(current_date);
            $('#submitSuccessModal').modal('show');
        }
    });
}

function loadDataSubmit(isSubmit) {
    if (isSubmit) {
        $('#manaName').prop('disabled', true);
        $('#btnSubmit').prop('disabled', true);
        $('#btnSave').prop('disabled', true);
        $('#manaId').prop('disabled', true);
        $('#btnCheck').prop('disabled', true);

        $('#staffSelfArea .Editor-editor').attr('contenteditable', false);
        $('#staffPerArea .Editor-editor').attr('contenteditable', false);
        $('#staffGoalsArea .Editor-editor').attr('contenteditable', false);
        $('#staffComtArea .Editor-editor').attr('contenteditable', false);
    } else {
        //$('#manaName').prop('disabled', false);
        $('#btnSubmit').prop('disabled', false);
        $('#btnSave').prop('disabled', false);
        $('#manaId').prop('disabled', false);
        $('#btnCheck').prop('disabled', false);

        $('#staffSelfArea .Editor-editor').attr('contenteditable', true);
        $('#staffPerArea .Editor-editor').attr('contenteditable', true);
        $('#staffGoalsArea .Editor-editor').attr('contenteditable', true);
        $('#staffComtArea .Editor-editor').attr('contenteditable', true);
    }
}

