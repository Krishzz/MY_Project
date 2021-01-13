/******************************************************************************
 Author	: Teo How Jiann
 Created	: 31/05/2010

 This file contains JavaScript functions for the Assignment section
 ******************************************************************************/

var	NEED_SAVE = false
var	AFFECTED_ROW = new Array()
var	AUTOTRIGGER_ROW = new Array()
var	cur_AA_AJAX

var CLICK_DELAY = 500, CLICK_CNT = 0, CLICK_TIMER = null;
var	RESIZE_TIMER = null;
var	UPLOAD_DIALOG_OPEN	= 0
var	STATUS_CHANGE_DIALOG_OPEN	= 0
var NOREFRESH	= 0
var REFRESH_STATE	= null
var REFRESH_FREQ	= 600000
var	STARTTIME
var uploadNotesJSON = ""
//============================================================================
// Assignment Manager
//============================================================================

$(document).ready(function () {

});

function abortExistingAJAX(url){
	if (cur_AA_AJAX != null) {
//		console.log("ABORTING AJAX CALL FOR NEW AJAX TO >> "+ url);
		cur_AA_AJAX.abort()
	}
}

function ass_initAssignment() {

	ass_initAssignmentGUI()
	ass_initAssignmentAction()
	ass_initAssignmentState()

	ass_autoRefreshChange()

	ass_getUserNameList()
	ass_getMainStatusList()
	ass_assignTypeChanged()

	var	assType	= getSPKCookie("SPK_AA_CurAssignType");
	var	srcStr	= GetCookie("SPK_AA_SearchStr");
//    console.log("Testing")
	// ass_getShotComponentList();
}

function ass_initAssignmentGUI() {
	$("#PageTitle").text("Asset Assign")

	var	layoutSetting	= getLayoutSetting('AssignmentManager')
//	console.log(layoutSetting)
	layoutSetting.west.size		= 200
	layoutSetting.west.minSize	= 200
	layoutSetting.east.size		= 200
	layoutSetting.east.minSize	= 200
	$("#AA_MAIN").layout(layoutSetting)

	var	curTab	= getSPKCookie("SPK_AA_CurTab")
//	console.log(curTab)
	$("#AA_TAB").tabs({
		active: curTab,
		beforeActivate: function(event, ui) {
			if (!ass_checkSave())
				return	false
		},
		activate: function(event, ui) {
			var preTab	= getSPKCookie("SPK_AA_CurTab")

			if (preTab == 0)
				$("#AA_ListSec").empty()
			else if (preTab == 1)
				$("#AA_GrandSEC").empty()
			else if (preTab == 2)
				$("#AA_THUMBSEC").empty()
			else if (preTab == 3)
				$("#AA_STATSEC").empty()
			else if (preTab == 4)
				$("#AA_PROGSEC").empty()
			else if (preTab == 5) {
				$("#AA_TASKLOADSEC").empty()
				$("#AA_fromDateFld").val('')
				$("#AA_toDateFld").val('')
			}

			var	curTab	= $("#AA_TAB").tabs("option", "active")

			setSPKCookie("SPK_AA_CurTab", curTab)
			ass_getContent()
		}
	})

	var	curCompTab	= getSPKCookie("SPK_AA_CurCompTab")
	$("#AA_CompTAB").tabs({
		active: curCompTab,
		activate: function(event, ui) {
			var preCompTab	= getSPKCookie("SPK_AA_CurCompTab")
			var	curCompTab	= $("#AA_CompTAB").tabs("option", "active")

			setSPKCookie("SPK_AA_CurCompTab", curCompTab)

			var curAKey	= $("#AS_ComponentInfoDialog").data('curAKey')
			ass_getComponentInfoContent(curAKey)
		}
	})

	$(".spk-dialog").dialog({
		modal: true,
		width: 350,
		maxHeight: '80%',
		maxWidth: '80%',
		autoOpen: false,
		open: function( event, ui ) {
			NOREFRESH	= 1
		}
	})

	$('.spk-date').datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: 'yy-mm-dd',
		showOtherMonths: true,
		selectOtherMonths: true
	});
    initAccordian()
// Need to update the function
//    console.log("testtttttttt")
//    console.log(GetCookie('SPK_TIMEZONELIST'))
//	var	tzObj	= JSON.parse(GetCookie('SPK_TIMEZONELIST'))
//    console.log(tzObj)
//
//	$('.spk-dueDate').datetimepicker({
//		changeMonth: true,
//		changeYear: true,
//		dateFormat: 'yy-mm-dd',
//		timeFormat: 'HH:mm:ss z',
//		showOtherMonths: true,
//		selectOtherMonths: true,
//		numberOfMonths: 2,
//		timezoneList: tzObj,
//		onClose: function(dDateStr,inst){
//			var	dueDate	= $(this).datetimepicker("getDate")
//			if (dueDate==null || '')
//				$(this).val('')
//			else {
//				var	dateStr	= getDateTimeString(dueDate) + ' ' + GetCookie('SPK_TIMEZONESTR')
//				$(this).val(dateStr)
//			}
//		}
//	});



	$("#AA_refreshBtn").button({icons:{primary:'ui-icon-refresh'}})
	$("#AA_saveBtn").button({icons:{primary:'ui-icon-disk'}})
	$("#AA_tbvs2BtnRF").button({icons:{primary:'ui-icon-closethick'}})
	//Rajesh Fithelis Test Save Button for Auto Status change
	$("#AA_saveBtnRF").button({icons:{primary:'ui-icon-circle-close'}})
	$("#AA_saveAssetAT").button({icons:{primary:'ui-icon-circle-close'}})
	$("#AA_ExportXLSBtn").button({icons:{primary:' ui-icon-circle-triangle-s'}})

	$("#AA_SelectedBtn").button({icons:{primary:'ui-icon-tag', secondary:'ui-icon-triangle-1-s'}})
	$("#AA_ShortcutBtn").button({icons:{primary:'ui-icon-arrowreturnthick-1-s', secondary:'ui-icon-triangle-1-s'}})
	$("#AA_uploadNoteBtn").button({icons:{primary:'ui-icon-script'}})
	$("#AA_uploadNoteBtn2").button({icons:{primary:'ui-icon-calculator'}})
	$("#AA_changeStatusBtn2").button({icons:{primary:'ui-icon-transfer-e-w'}})
	$("#AA_OptionsBtn").button({icons:{primary:'ui-icon-wrench'}})


	$("#AA_buttonSec").buttonset()
	console.log($("#AA_SelectedBtn"))

	$("#AA_SelectedMenuSec").position({
		of: $("#AA_SelectedBtn"),
		my: 'left top',
		at: 'left bottom',
	})
//
//	$("#AA_ShortcutMenuSec").position({
//		of: $("#AA_ShortcutBtn"),
//		my: 'left top',
//		at: 'left bottom',
//	})
//
//	$("#AA_OptionsMenuSec").position({
//		of: $("#AA_OptionsBtn"),
//		my: 'left top',
//		at: 'left bottom',
//	})

	$("#AA_OptionsMenuSec").hide();
	$("#AA_OptionsMenuSec").menu();

	$("#AA_createShotBtn").button({icons:{primary:'ui-icon-document'}})
		.css('width', '100%')

	$("#AA_PlayAnimaticBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayBlockingBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayAnimationBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayRoughAnimationBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayQCBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayClothSimBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayHairBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayCrowdBtn").button({icons:{secondary:'ui-icon-play'}})
	$("#AA_PlayRenderBtn").button({icons:{secondary:'ui-icon-play'}})

	$(".invBtn").button({icons:{primary:'ui-icon-play'}})

	$("#AA_clearSearchBtn").button({
		icons:{primary:'ui-icon-close'},
		text: false
	})

	$("#AA_clearFromDateBtn").button({
		icons:{primary:'ui-icon-close'},
		text: false
	})

	$("#AA_clearToDateBtn").button({
		icons:{primary:'ui-icon-close'},
		text: false
	})

	$("#AA_priority").spinner({
		max: 99,
		min: 0,
		page: 10,
		step: 5
	})

	ass_statusChange("AA_UpdateStatusFilList")
	ass_statusChange("AA_ReassignStatusFilList")

	$(".spk-dp-menu").hide();
	$(".spk-dp-menu").menu();
}

//Rajesh Fithelis
//To show the Save Assset AT button on Assignment Type Asset
function ass_checkAssetSaveAT(){
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	if (assType=='Asset') {
		$("#AA_saveAssetAT").show()
		$("#AA_saveBtnRF").hide()
	}
}

//Rajesh Fithelis
//To show the Save Shot AT button on Assignment Type Shot
function ass_checkShotSaveAT(){
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	if (assType=='Shot') {
		$("#AA_saveAssetAT").hide()
		$("#AA_saveBtnRF").show()
	}
}

function ass_initAssignmentAction() {
	$("#AA_assignTypeList").change(function() {ass_assignTypeChanged()})
	$("#AA_statusFilList").change(function() {ass_statusFilChanged()})

	$("#AA_dateList").change(function() {setSPKCookie("SPK_AA_CurDate", $("#AA_dateList").val());ass_resetScroll();ass_getContent();})
	$("#AA_dateModeList").change(function() {setSPKCookie("SPK_AA_CurDateMode", $("#AA_dateModeList").val());ass_resetScroll();ass_getContent();})

	$("#AA_fromDateFld").change(function() {ass_resetScroll();ass_getContent();})
	$("#AA_toDateFld").change(function() {ass_resetScroll();ass_getContent();})

	$("#AA_projList").change(function() {ass_projChanged()})

	$("#AA_assetCategoryList").change(function() {ass_assetCategoryChanged()})
	$("#AA_assetGroupList").change(function() {ass_assetGroupChanged()})
	$("#AA_assetComponentList").change(function() {ass_assetComponentChanged()})

	$("#AA_shotComponentList").change(function() {ass_shotComponentChanged()})
	$(".spk-shotLevelList").change(function() {ass_getShotLevelList($(this).data('level'))})
	$("#AA_createShotBtn").click(function() {ass_createNewShotLastLevel()})

	$("#AA_searchFld").change(function() {setSPKCookie("SPK_AA_SearchStr", $("#AA_searchFld").val());ass_resetScroll();ass_getContent();})
	$("#AA_clearSearchBtn").click(function() {$("#AA_searchFld").val('');setSPKCookie("SPK_AA_SearchStr", $("#AA_searchFld").val());ass_resetScroll();ass_getContent()})
	$("#AA_exactMatchChkBox").change(function() {ass_exactMatch()})
	$("#AA_shotMatchChkBox").change(function() {ass_shotMatch()})

	$("#AA_clearFromDateBtn").click(function() {$("#AA_fromDateFld").val('');/*setSPKCookie("SPK_AA_SearchStr", $("#AA_searchFld").val());*/ass_resetScroll();ass_getContent()})
	$("#AA_clearToDateBtn").click(function() {$("#AA_toDateFld").val('');/*setSPKCookie("SPK_AA_SearchStr", $("#AA_searchFld").val());*/ass_resetScroll();ass_getContent()})

	$("#AA_studioList").change(function() {ass_getUserNameList()})
	$("#AA_userTeamList").change(function() {ass_getUserNameList()})
	$("#AA_userList").change(function() {ass_userChanged()})

	$("#AA_recordsPerPageList").change(function() {ass_recordsPerPageChanged()})

	$("#AA_UpdateStatusFilList").change(function() {
		var	curKey	= $(this).val()

		// console.log(curKey)
		// This is using StatusKey
		// <SPK Approve, Lead Note, Extend Due Date, Msc Retake, Serious Mistake
		if (curKey<4 || curKey==8 || curKey==10 || curKey==13 || curKey==16)
			$("#AA_US_dueDateFld").prop("disabled", false)
		else
			$("#AA_US_dueDateFld").prop("disabled", true)
		ass_statusChange("AA_UpdateStatusFilList")
	})
	$("#AA_ReassignStatusFilList").change(function() {ass_statusChange("AA_ReassignStatusFilList")})
	$("#AA_UN_statusFilList").change(function() {ass_statusChange("AA_UN_statusFilList")})
    $("#AA_UN_statusFilList2").change(function() {assignManager.events.statusChanged($(this))})
    $("#AA_statusSelectList").change(function() {assignManager.events.statusChanged($(this))})

	$("#AA_UN_UploadExcelMode").change(function(){
			id = $(this).attr('id');
			value= $(this).val();
			$("[id^="+id+"_]").hide();
			$("#"+id+"_"+value).show();
			// console.log(id+"_"+value);
			uploadNotesJSON = "";
			$( '#AA_UN_file_label' ).html( "Choose a file" );
			$("#AA_UN_UploadExcelMode_Info").empty()
	});

	$("#AA_US_dueDateFld").change(function() {ass_dueDateChange("AA_US_dueDateFld")})
	$("#AA_RA_DueDate").change(function() {ass_dueDateChange("AA_RA_DueDate")})
	$("#AA_statOptionList").change(function() {ass_statOptionChange()})
	$("#AA_statAssetTagChkBox").change(function() {ass_statAssetTagChange()})
	$("#AA_statUserChkBox").click(function() {ass_statUserChange()})
	$("#AA_CalenderOptionList").change(function() {ass_calendarOptionChange()})
	$("#AA_DataOptionList").change(function() {ass_dataOptionChange()})
	$("#AA_ModeOptionList").change(function() {ass_modeOptionChange()})

	$("#AA_AutoRefreshChkBox").change(function() {ass_autoRefreshChange()})

	$(".spk_menuSet").mouseover(function(index) {
		var	dpMenu	= $(this).data('label')
		$("#" + dpMenu + "MenuSec").show()
	})

	$(".spk_menuSet").mouseout(function(index) {
		var	dpMenu	= $(this).data('label')
		$("#" + dpMenu + "MenuSec").hide()
	})

	$("#AA_refreshBtn").click(function() {ass_getContent()})
	$("#AA_copySrcBtn").click(function() {ass_copySelectedToSearch()})
	$("#AA_playBtn").click(function() {ass_viewSelectedVideo()})
	$("#AA_syncRenderBtn").click(function() {ass_syncSelectedRenderLayers()})
	//Rajesh Fithelis: SyncPlayblast
	$("#AA_syncPlayblastBtn").click(function() {ass_syncSelectedPlayblast()})
	$("#AA_syncLatestPlayblastFilesBtn").click(function() {ass_syncSelectedLatestPlayblastFiles()})
	$("#AA_syncCompBtn").click(function() {ass_syncSelectedCompImages()})
	$("#AA_submitShotFileToBBFBtn").click(function() {ass_submitShotFileToBBF()})
	$("#AA_submitShotFileToClientBtn").click(function() {ass_submitShotFileToClient()})
	$("#AA_convertToAvidMOVBtn").click(function() {ass_convertToAvidMOV()})
	$("#AA_convertToNukeMOV_DNxHDBtn").click(function() {ass_convertToNukeMOV_DNxHD()})

	$("#AA_setPrioritySelBtn").click(function() {ass_setPrioritySelectedAssignment()})
	$("#AA_setAutoTriggerBtn").click(function() {ass_setAutoTriggerAssignment()})
	$("#AA_reassignSelBtn").click(function() {ass_reassignSelectedAssignment()})
	$("#AA_deleteSelBtn").click(function() {ass_deleteSelectedAssignment()})
	$("#AA_copyPRSelBtn").click(function() {ass_copyPreviousRemarsk()})
	$("#AA_clearSelBtn").click(function() {ass_clearSelectedAssignment()})
	$("#AA_saveBtn").click(function() {ass_saveAssignment()})
	//Rajesh Fithelis Test Save Button for Auto Status Update
	$("#AA_saveBtnRF").click(function() {ass_saveAssignmentRF()})
	$("#AA_saveAssetAT").click(function() {ass_saveAssetAT()})
	$("#AA_ExportXLSBtn").click(function() {ass_exportXLS()})
	$("#AA_tbvs2BtnRF").click(function() {copyFinalFilesToClientFldSG()})
	//$("#remarksVideoUpBtn").click(function() {ass_uploadRemarksVideo()})
	// $("#AA_uploadNoteBtn").click(function() {ass_uploadNotes()})
	$("#AA_uploadNoteBtn2").click(function() {ass_uploadNotes2()})
	//Rajesh Fithelis
	//$("#AA_changeStatusBtn2").click(function() {ass_sht_status_change()})

	$("#AA_myPendingBtn").click(function() {ass_filterTask(0)})
	$("#AA_allPendingBtn").click(function() {ass_filterTask(1)})
	$("#AA_allSubmitBtn").click(function() {ass_filterTask(2)})
	$("#AA_allSPKApproveBtn").click(function() {ass_filterTask(3)})
	$("#AA_allExceptObsoleteBtn").click(function() {ass_filterTask(4)})

	$("#AA_PlayAnimaticBtn").click(function() {ass_play('StoryBoard')})
	$("#AA_PlayBlockingBtn").click(function() {ass_play('Blocking')})
	$("#AA_PlayAnimationBtn").click(function() {ass_play('Animation')})
	$("#AA_PlayRoughAnimationBtn").click(function() {ass_play('RoughAnimation')})
	$("#AA_PlayQCBtn").click(function() {ass_play('QC')})
	$("#AA_PlayClothSimBtn").click(function() {ass_play('ClothSim')})
	$("#AA_PlayHairBtn").click(function() {ass_play('Hair')})
	$("#AA_PlayCrowdBtn").click(function() {ass_play('Crowd')})
	$("#AA_PlayRenderBtn").click(function() {ass_play('Lighting')})

	$("#AA_StatusListInvChkBox").click(function() {ass_statusInvert()})
	$("#AA_TypeListMatchAllSelectedAssetComponentsChkBox").click(function() {ass_matchAllSelectedComponents()})
	$("#AA_TypeListMatchAllSelectedShotComponentsChkBox").click(function() {ass_matchAllSelectedComponents()})

	$("#AA_RA_KeepTaskName").click(function(){ass_disableInput("AA_RA_KeepTaskName", "AA_RA_TaskName")})
	$("#AA_RA_KeepDueDate").click(function(){ass_disableInput("AA_RA_KeepDueDate", "AA_RA_DueDate")})
	$("#AA_RA_KeepStatus").click(function(){ass_disableInput("AA_RA_KeepStatus", "AA_ReassignStatusFilList")})
	$("#AA_RA_CopyRemark").click(function(){ass_disableInput("AA_RA_CopyRemark", "AA_RA_Remarks")})

	$("#AA_IgnoreHierarchyBtn").click(function() {ass_ignoreHierarchy()})

	var	uGrpKey	= getSPKCookie('SPK_CurUserGroupKey')
	// hide protected note from normal users
	if (uGrpKey<3)
		$("#AA_statusFilList").children("[value='12']").hide()

	//need heavy refactor
	$('#AA_UN_file').on( 'change', function( e ) {
		// console.log(e)
		modeInfo = $("#AA_UN_UploadExcelMode_Info")
		retakeRoundDropdown = $("#AA_UN_retakeRoundFilList")

		modeInfo.hide()
		$("#AA_UN_UploadExcelMode_Warn").hide()
		$("#AA_UN_UploadExcelMode_Error").hide()

		$label	 = $( '#AA_UN_file_label' );
		$labelVal = "Choose a file";
		var fileName = '';
		var disable_bg = {
			'background': '#8d9e61'
		};
		var enable_bg = {
			'background': 'white'
		};

		if (e.target.value)
			fileName = e.target.value.split('\\').pop();


		console.log(fileName)
		if (fileName) {

			$label.html(fileName);
			ass_uploadExcel();
			retakeRoundDropdown.attr('disabled', true);
			retakeRoundDropdown.css(disable_bg);

		}else{
			$label.html( $labelVal );
			uploadNotesJSON= "";
			modeInfo.hide();
			modeInfo.empty();
			retakeRoundDropdown.attr('disabled', false);
			retakeRoundDropdown.css(enable_bg);
		}
	});

}

function ass_disableInput(check, input) {
	if ($("#"+check).prop("checked"))
		$("#"+input).prop("disabled", true);
	else
		$("#"+input).prop("disabled", false);
}

function ass_ignoreHierarchy(){
	var	ignore	= getSPKCookie("SPK_AA_IgnoreHierarchy")
	if (ignore == "" || ignore == "0")
		setSPKCookie("SPK_AA_IgnoreHierarchy", "1")
	else
		setSPKCookie("SPK_AA_IgnoreHierarchy", "0")

	ass_resetScroll()
	ass_getContent();
}

function ass_initAssignmentState() {
	applySPKCookie('SPK_AA_AutoRefresh', 'AA_AutoRefreshChkBox', '')

	applySPKCookie('SPK_CurProject', 'AA_projList', 'ALL')
	setTitle($("#AA_projList option:selected").text())

	applySPKCookie('SPK_AA_CurAssignType', 'AA_assignTypeList', '')
	applySPKCookie('SPK_AA_CurStatus', 'AA_statusFilList', 'ALL')
	applySPKCookie('SPK_AA_CurStatusListInv', 'AA_StatusListInvChkBox', 'FALSE')
	applySPKCookie('SPK_AA_MatchAllSelectedComponents', 'AA_TypeListMatchAllSelectedAssetComponentsChkBox', 'FALSE')
	applySPKCookie('SPK_AA_MatchAllSelectedComponents', 'AA_TypeListMatchAllSelectedShotComponentsChkBox', 'FALSE')

	applySPKCookie('SPK_AA_CurAssetCat', 'AA_assetCategoryList', 'ALL')
	applySPKCookie('SPK_AA_CurAssetGroup', 'AA_assetGroupList', 'ALL')
	applySPKCookie('SPK_AA_CurAssetComponent', 'AA_assetComponentList', 'ALL')

	applySPKCookie('SPK_AA_CurShotComp', 'AA_shotComponentList', 'ALL')
	applySPKCookie('SPK_AA_CurMaxShotLevel', '', 1)

	for (i=1; i<6; i++)
		applySPKCookie(('SPK_AA_ShotLevelNum'+i), ('AA_ShotLevelList'+i), 'ALL')

	applySPKCookie('SPK_AA_CurStudio', 'AA_studioList', 'ALL')
	applySPKCookie('SPK_AA_CurUserTeam', 'AA_userTeamList', 'ALL')
	applySPKCookie('SPK_AA_CurUserKey', 'AA_userList', 'ALL')

	applySPKCookie('SPK_AA_CurDate', 'AA_dateList', 'ALL')
	applySPKCookie('SPK_AA_CurDateMode', 'AA_dateModeList', 0)

	applySPKCookie('SPK_AA_RecordsPerPage', 'AA_recordsPerPageList', '')

	applySPKCookie('SPK_AA_Page', '', 1)
	applySPKCookie('SPK_AA_OrderBy', '', '')
	applySPKCookie('SPK_AA_Order', '', 'ASC')

	applySPKCookie('SPK_AA_CurCompInfoSortType', 'AA_compSortList', 'Date')

	applySPKCookie('SPK_AA_CurStatOption', 'AA_statOptionList', 1)
	applySPKCookie('SPK_AA_CurStatAssetTag', 'AA_statAssetTagChkBox', 'FALSE')
	applySPKCookie('SPK_AA_CurStatUser', 'AA_statUserChkBox', 'FALSE')

	applySPKCookie('SPK_AA_CalendarOption', 'AA_CalenderOptionList', 'Week')
	applySPKCookie('SPK_AA_DataOption', 'AA_DataOptionList', 'TaskCount')
	applySPKCookie('SPK_AA_ModeOption', 'AA_ModeOptionList', 0)

	applySPKCookie('SPK_AA_SearchStr', 'AA_searchFld', '')
	applySPKCookie('SPK_AA_ExactMatch', 'AA_exactMatchChkBox', 'FALSE')
}

function ass_getContent() {
	if (!ass_checkSave())
		return
	//Rajesh Fithelis for SaveAT button Enable
	ass_checkAssetSaveAT()
	ass_checkShotSaveAT()

	SPK_CHECKBOX_INDEX	= ''

	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	pKey	= getSPKCookie("SPK_CurProject")

	var	prog	= "<img src='img/load.gif' style='margin:5px;'>Loading...</img>"

	var	dateMode= getSPKCookie("SPK_AA_CurDateMode")
	if (dateMode>7)
		$('#AA_dateRangeSec').show()
	else {
		$('#AA_dateRangeSec').hide()

		if (dateMode==0) {
			$("#AA_fromDateFld").val('')
			$("#AA_toDateFld").val('')
		}
		else {
			var	today		= new Date()
			var	curYear		= today.getFullYear()
			var	curMonth	= today.getMonth()
			var	curDay		= today.getDate()
			var	curWeekDay	= today.getDay()
			var	fromDateObj	= new Date()
			var	toDateObj	= new Date(curYear, curMonth, curDay)

			if (dateMode==1)
				fromDateObj	= new Date(curYear, curMonth, curDay)
			else if (dateMode==2) {
				fromDateObj	= new Date(curYear, curMonth, curDay-1)
				toDateObj	= new Date(curYear, curMonth, curDay+1)
			}
			else if (dateMode==3) {
				fromDateObj	= new Date(curYear, curMonth, curDay-curWeekDay+1)
				toDateObj	= new Date(curYear, curMonth, curDay-curWeekDay+7)
			}
			else if (dateMode==4) {
				fromDateObj	= new Date(curYear, curMonth, curDay-curWeekDay-6)
				toDateObj	= new Date(curYear, curMonth, curDay-curWeekDay+14)
			}
			else if (dateMode==5) {
				fromDateObj	= new Date(curYear, curMonth, 1)
				toDateObj	= new Date(curYear, curMonth+1, 0)
			}
			else if (dateMode==6) {
				fromDateObj	= new Date(curYear, curMonth-1, 1)
				toDateObj	= new Date(curYear, curMonth+2, 0)
			}
			else if (dateMode==7) {
				fromDateObj	= new Date(curYear, 0, 1)
				toDateObj	= new Date(curYear, 11, 31)
			}

			fromDate	= fromDateObj.getFullYear() + '-' + (fromDateObj.getMonth()+1) + '-' + fromDateObj.getDate()
			toDate		= toDateObj.getFullYear() + '-' + (toDateObj.getMonth()+1) + '-' + toDateObj.getDate()

			$("#AA_fromDateFld").val(fromDate)
			$("#AA_toDateFld").val(toDate)
		}
	}

	$("#AA_submitShotFileToBBFBtn").hide()
	$("#AA_submitShotFileToClientBtn").hide()
	$("#AA_convertToAvidMOVBtn").hide()
	$("#AA_convertToNukeMOV_DNxHDBtn").hide()
	var	curTab	= $("#AA_TAB").tabs("option", "active")
	if (curTab == 0) {
		$("#AA_assetGroupSec").show()
		$("#AA_ShotLevelSec").show()
		$("#AA_searchSec").show()
		$("#AA_dateList").show()
		$("#AA_recordsPerPageSec").show()
		$("#AA_SelectedBtn").show()
		$("#AA_saveBtn").show()
		$("#AA_uploadNoteBtn").show()
		//$("#AA_pageSec").hide()
		$("#AA_playBtn").show()
		$("#AA_deleteSelBtn").show()
		$("#AA_copyPRSelBtn").show()
		$("#AA_setPrioritySelBtn").show()
		$("#AA_reassignSelBtn").show()
		$("#AA_clearSelBtn").show()

		$("#AA_GrandSEC").empty()
		$("#AA_THUMBSEC").empty()
		$("#AA_STATSEC").empty()
		$("#AA_PROGSEC").empty()
		$("#AA_TASKLOADSEC").empty()

		if (assType=='Shot' && (pKey==77 || pKey==69 || pKey==100 || pKey==107 || pKey==120)){
			$("#AA_submitShotFileToBBFBtn").show()
			$("#AA_convertToAvidMOVBtn").show()
		}

		if (assType=='Shot' && (pKey==102 || pKey==106)){
			$("#AA_submitShotFileToClientBtn").show()
			$("#AA_convertToNukeMOV_DNxHDBtn").show()
		}

		// $("#AA_ProgressSec").show()
		inProgress()
		//console.log('ass_getContent:ass_getAssignment')
//rajeshf-start
		var	curAssType	= $("#AA_assignTypeList").val()
		var	curUsrGrp	= getSPKCookie("SPK_UP_CurUserGroupKey")
		if ((curAssType=="Asset") && (curUsrGrp>2)) {
			$("#AA_saveBtn").show()
		}
		if ((curAssType=="Shot") && (curUsrGrp>2)) {
			$("#AA_saveBtn").hide()
			//$("#AA_saveBtn").hide()
		}
//rajeshf-end
		ass_getAssignment()
	}
	else if (curTab == 1) {
		$("#AA_assetGroupSec").show()
		$("#AA_ShotLevelSec").show()
		$("#AA_searchSec").show()
		$("#AA_dateList").show()
		$("#AA_recordsPerPageSec").show()
		$("#AA_SelectedBtn").show()
		$("#AA_saveBtn").hide()
		$("#AA_uploadNoteBtn").hide()
		$("#AA_playBtn").hide()
		$("#AA_deleteSelBtn").hide()
		$("#AA_copyPRSelBtn").hide()
		$("#AA_setPrioritySelBtn").hide()
		$("#AA_reassignSelBtn").hide()
		$("#AA_clearSelBtn").hide()

		$("#AA_ListSec").empty()
		$("#AA_THUMBSEC").empty()
		$("#AA_STATSEC").empty()
		$("#AA_PROGSEC").empty()
		$("#AA_TASKLOADSEC").empty()

		// $("#AA_ProgressSec").show()
		inProgress()
		ass_getAssignmentGrand()
	}
	else if (curTab == 2) {
		$("#AA_assetGroupSec").show()
		$("#AA_ShotLevelSec").show()
		$("#AA_searchSec").show()
		$("#AA_dateList").show()
		$("#AA_recordsPerPageSec").show()
		$("#AA_SelectedBtn").show()
		$("#AA_saveBtn").hide()
		$("#AA_uploadNoteBtn").hide()
		$("#AA_playBtn").hide()
		$("#AA_deleteSelBtn").hide()
		$("#AA_copyPRSelBtn").hide()
		$("#AA_setPrioritySelBtn").hide()
		$("#AA_reassignSelBtn").hide()
		$("#AA_clearSelBtn").hide()

		$("#AA_ListSec").empty()
		$("#AA_GrandSEC").empty()
		$("#AA_STATSEC").empty()
		$("#AA_PROGSEC").empty()
		$("#AA_TASKLOADSEC").empty()

		// $("#AA_ProgressSec").show()
		inProgress()
		ass_getAssignmentThumbnail()
	}
	else if (curTab == 3) {
		$("#AA_assetGroupSec").show()
		$("#AA_ShotLevelSec").show()
		$("#AA_searchSec").show()
		$("#AA_dateList").show()
		$("#AA_recordsPerPageSec").hide()
		$("#AA_SelectedBtn").hide()
		$("#AA_saveBtn").hide()
		$("#AA_uploadNoteBtn").hide()
		$("#AA_pageSec").hide()
		$("#AA_playBtn").hide()

		$("#AA_ListSec").empty()
		$("#AA_GrandSEC").empty()
		$("#AA_THUMBSEC").empty()
		$("#AA_PROGSEC").empty()
		$("#AA_TASKLOADSEC").empty()

		// $("#AA_ProgressSec").show()
		inProgress()
		ass_getAssignmentStat()
	}
	else if (curTab == 4) {
		$("#AA_assetGroupSec").show()
		$("#AA_ShotLevelSec").show()
		$("#AA_searchSec").show()
		$("#AA_dateList").show()
		$("#AA_recordsPerPageSec").hide()
		$("#AA_SelectedBtn").hide()
		$("#AA_saveBtn").hide()
		$("#AA_uploadNoteBtn").hide()
		$("#AA_pageSec").hide()
		$("#AA_playBtn").hide()

		$("#AA_ListSec").empty()
		$("#AA_GrandSEC").empty()
		$("#AA_THUMBSEC").empty()
		$("#AA_STATSEC").empty()
		$("#AA_TASKLOADSEC").empty()

		// $("#AA_ProgressSec").show()
		inProgress()
		ass_getAssignmentProg()
	}
	else if (curTab == 5) {
		$("#AA_assetGroupSec").hide()
		$("#AA_ShotLevelSec").hide()
		$("#AA_searchSec").hide()
		$("#AA_dateList").hide()
		$("#AA_recordsPerPageSec").hide()
		$("#AA_SelectedBtn").hide()
		$("#AA_uploadNoteBtn").hide()
		$("#AA_saveBtn").hide()
		$("#AA_pageSec").hide()
		$("#AA_playBtn").hide()

		$("#AA_ListSec").empty()
		$("#AA_GrandSEC").empty()
		$("#AA_THUMBSEC").empty()
		$("#AA_STATSEC").empty()
		$("#AA_PROGSEC").empty()

		// $("#AA_ProgressSec").show()
		inProgress()
		ass_getAssignmentTaskLoad()
	}

	applySPKCookie('SPK_AA_AutoRefresh', 'AA_AutoRefreshChkBox', '')
	ass_autoRefreshChange()
}

function ass_getComponentInfoContent(curAKey) {
	if (curAKey=="")
		return;

	var	curCompTab	= $("#AA_CompTAB").tabs("option", "active")
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")

	var	prog	= "<img src='img/load.gif' style='margin:5px;'>Loading...</img>"

	if (assType != "Asset") {
		curCompTab	= 0
		setSPKCookie("SPK_AA_CurCompTab", curCompTab)
		$("#AA_PlaySec").show()
		//$("#compTabs-2").hide()
		//$("#AA_CompTAB").tabs("option", "active", 0)
	}
	else {
		$("#AA_PlaySec").hide()
		//$("#compTabs-2").show()
		//$("#AA_CompTAB").tabs("option", "active", 1)
	}

	$("#AS_ComponentInfoDialog").data('curAKey', curAKey)

	//var	curTab	= $("#AA_CompTAB").tabs("option", "active")


	if (curCompTab == 0) {
		ass_loadComponentInfo(curAKey)
	}
	else if (curCompTab == 1) {
		ass_loadComponentImages(curAKey)
	}
}

function ass_getShotHierarchy() {
	var	curPKey	= getSPKCookie("SPK_CurProject")
//    console.log(curPKey)
	if (curPKey=="ALL") {
		$("#AA_createShotBtn").hide()
		$(".spk-shotLevel").hide()

		ass_getShotComponentList()
	}
	else {
		$("#AA_createShotBtn").show()
		$(".spk-shotLevel").show()

		////abortExistingAJAX("/php/getShotHierarchy.php");

		// if (cur_AA_AJAX != null)
		// 	cur_AA_AJAX.abort()

		cur_AA_AJAX	= $.getJSON(
			"getShotHierarchy", {
				projectkey:curPKey,
				mode:0
			},
			function(data) {ass_getShotHierarchy_CB(data)}
		)
	}

	////inProgress()
}

function ass_getShotHierarchy_CB(data) {
	$(".spk-shotLevel").hide()
//    console.log(data.data)
	if (data.data.NumOfLevel != null) {
		setSPKCookie("SPK_AA_CurMaxShotLevel", data.data.NumOfLevel)

		for (i=1; i<data.data.NumOfLevel; i++) {
			$("#AA_ShotLevelLabel" + i).text(data.data.Level[i-1])
			$("#AA_ShotLevelSec" + i).show()
			$("#AA_ShotLevelList" + i).attr('size', 1)
		}
		$("#AA_ShotLevelLabel" + data.data.NumOfLevel).text(data.data.Level[data.data.NumOfLevel-1])

		var	curStat	= getSPKCookie("SPK_AA_CurStatOption")

		data.data.Index.pop()
		data.data.Level.pop()

		CreateOptionPair("AA_statOptionList", data.data.Index, data.data.Level, 1)
		applySPKCookie("SPK_AA_CurStatOption", 'AA_statOptionList', curStat)
	}

	ass_getShotLevelList(0)

	////endProgress()
}

function ass_getShotLevelList(curShotLevel) {
	var	maxLevel	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	var	projkey		= getSPKCookie("SPK_CurProject")

	if (curShotLevel>0) {
		setSPKCookie(("SPK_AA_ShotLevelNum" + curShotLevel), $("#AA_ShotLevelList" + curShotLevel).val())
	}

	if ((curShotLevel+1) >= maxLevel) {
		ass_getShotComponentList()
	}
	else {
		var	shotLevel	= new Array();
		if (curShotLevel>0) {
			for (i=1; i<=curShotLevel; i++) {
				var	temp	= $("#AA_ShotLevelList" + i).val()
				shotLevel[i-1]	= temp

				if (temp.length > 1) {
					if ( searchArray(temp, 'ALL')>=0) {
						shotLevel[i-1]	= 'ALL'
						setSPKCookie(("SPK_AA_ShotLevelNum" + i), 'ALL')
						$("#AA_ShotLevelList" + curShotLevel).val('ALL')
					}

					for(j=i+1; j<maxLevel; j++)
						setSPKCookie(("SPK_AA_ShotLevelNum" + j), '')
					break;
				}
			}

			if (shotLevel[curShotLevel-1]=='ALL') {
				for (i=(curShotLevel+1); i<6; i++)
					$("#AA_ShotLevelSec" + i).hide()

				ass_getShotComponentList()
				return
			}
			else {
				var	temp	= shotLevel[curShotLevel-1].toString().split(',')

				if (temp.length > 1) {
					for (i=(curShotLevel+1); i<6; i++)
						$("#AA_ShotLevelSec" + i).hide()

					ass_getShotComponentList()
					return
				}
			}
		}

		$("#AA_ShotLevelSec" + (curShotLevel+1)).show()

		////abortExistingAJAX("/php/getShotLevelList.php");

		// if (cur_AA_AJAX != null)
		// 	cur_AA_AJAX.abort()

		cur_AA_AJAX	= $.getJSON(
			"getShotLevelList", {
				projectkey:projkey,
				maxLevel:curShotLevel,
				'shotLevel[]':shotLevel
			},
			function(data) {ass_getShotLevelList_CB(data)}
		)

		////inProgress()
	}
}

function ass_getShotLevelList_CB(data) {
//	 console.log(data.data.CurShotLevel)
	if (data.data.ShotNum != null) {
		var	maxLevel	= getSPKCookie("SPK_AA_CurMaxShotLevel")
		var	curShot		= getSPKCookie("SPK_AA_ShotLevelNum" + data.data.CurShotLevel)

		for (idx in data.data.ShotTitle) {
			if (data.data.ShotTitle[idx] == null )
				data.data.ShotTitle[idx]	= data.data.ShotNum[idx]
//				console.log(data.data.ShotTitle[idx])
			else
				data.data.ShotTitle[idx]	= data.data.ShotNum[idx] + " - " + data.data.ShotTitle[idx]

		}

		data.data.ShotNum.unshift("ALL")
		data.data.ShotTitle.unshift("ALL")

		CreateOptionPair(("AA_ShotLevelList" + data.data.CurShotLevel), data.data.ShotNum, data.data.ShotTitle, '')
		applySPKCookie(("SPK_AA_ShotLevelNum" + data.data.CurShotLevel), ("AA_ShotLevelList" + data.data.CurShotLevel), curShot)

		if (data.data.CurShotLevel < (maxLevel-1))
			ass_getShotLevelList(data.data.CurShotLevel)
		else {
			ass_getShotComponentList()
		}
	}
	else {
		ClearOptions(("AA_ShotLevelList" + data.data.CurShotLevel))
	}

	////endProgress()
}

function ass_getShotComponentList() {
	var	curProj		= getSPKCookie("SPK_CurProject")
	var	maxLevel	= getSPKCookie("SPK_AA_CurMaxShotLevel")

	for (i=1; i<maxLevel-1; i++) {
		var	temp	= ($("#AA_ShotLevelList" + i).val() || '').toString().split(',')

		if (temp.length>1 || $("#AA_ShotLevelList" + i).val()=='ALL') {
			//if ($("#AA_ShotLevelList" + i).val()=='ALL') {
			$("#AA_ShotLevelList" + i).prop('multiple', true)

			var	size	= Math.min($("#AA_ShotLevelList" + i).children().length, 8)
			$("#AA_ShotLevelList" + i).attr('size', size)
			break
		}

		$("#AA_ShotLevelList" + i).prop('multiple', false)
		$("#AA_ShotLevelList" + i).attr('size', 1)
	}

	var	size	= Math.min($("#AA_ShotLevelList" + (maxLevel-1)).children().length, 8)
	$("#AA_ShotLevelList" + (maxLevel-1)).prop('multiple', true)
	$("#AA_ShotLevelList" + (maxLevel-1)).attr('size', size)

	////abortExistingAJAX("/php/getShotComponentList.php");

	// if (cur_AA_AJAX != null)
	// 	console.log("ABORTING AJAX");
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.getJSON(
		"getShotComponentList", {
			pKey:curProj,
			mode:0
		},
		function(data) {ass_getShotComponentList_CB(data)}
	)

	////inProgress()
}

function ass_getShotComponentList_CB(data) {
//	console.log(data.data)
	if (data.data.ShotComponentType != null) {
		var	curSComp	= getSPKCookie("SPK_AA_CurShotComp")

		data.data.ShotComponentType.unshift('ALL')

		CreateOptionPair("AA_shotComponentList", data.data.ShotComponentType, data.data.ShotComponentType, '')
		applySPKCookie("SPK_AA_CurShotComp", 'AA_shotComponentList', curSComp)
	}
	else {
		var	all	= new Array()
		all[0]	= "ALL"

		setSPKCookie("SPK_AA_CurShotComp", all[0])
		CreateOptionPair("AA_shotComponentList", all, all, '')
		applySPKCookie("SPK_AA_CurShotComp", 'AA_assetComponentList', 'ALL')
	}

	ass_resetScroll()
	ass_getContent()

	////endProgress()
}

function ass_getUserNameList() {
	var	assType		= getSPKCookie("SPK_AA_CurAssignType")
	var	pKey		= getSPKCookie("SPK_CurProject")
	var	curStudio	= $("#AA_studioList").val()
	var	curUTeam	= $("#AA_userTeamList").val()

	setSPKCookie("SPK_AA_CurStudio", curStudio)
	setSPKCookie("SPK_AA_CurUserTeam", curUTeam)

	$.getJSON(
		"getUserNameList", {
			studio:curStudio,
			userTeam:curUTeam,
			projKey:pKey,
			aType:assType
		},


		function(data) {


		ass_getUserNameList_CB(data)
		}

	)

	//////inProgress()
}

function ass_getMainStatusList() {
	$.getJSON(
		"getStatusList", {
			mode:0,
			orderBy:'SortOrder',
			order:'ASC'
		},
		function(data) {
			$("#AA_MAIN").data("StatusList", data)
		}
	)
}

function ass_getUserNameList_CB(data) {
	appendStatus(data)

	if (data.data.UserKey != null) {
		var	curUKey		= getSPKCookie("SPK_AA_CurUserKey")

		$("#AA_MAIN").data("UserList", data.data)

		$("#AA_userCount").text(data.data.UserKey.length)

		CreateOptionPair("AA_RA_UserList", data.data.UserKey, data.data.FullName, '')

		data.data.UserKey.unshift('-')
		data.data.FullName.unshift('-')
		CreateOptionPair("AA_assignToList", data.data.UserKey, data.data.FullName, '')

		data.data.UserKey.shift()
		data.data.FullName.shift()

		data.data.UserKey.unshift('ALL')
		data.data.FullName.unshift('ALL')

		CreateOptionPair("AA_userList", data.data.UserKey, data.data.FullName, '')
		applySPKCookie("SPK_AA_CurUserKey", 'AA_userList', curUKey)

		data.data.UserKey.shift()
		data.data.FullName.shift()

		// ass_resetScroll()
		// ass_getContent()
	}
	else {
		ClearOptions("AA_userList")
		ClearOptions("AA_assignToList")
		ClearOptions("AA_RA_UserList")
	}



	//////endProgress()
}

function ass_getAssetGroupList() {
	var	curPKey		= getSPKCookie("SPK_CurProject")
	var	curAssCat	= getSPKCookie("SPK_AA_CurAssetCat")

	////abortExistingAJAX("/php/getAssetGroupList.php");

	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.getJSON(
		"/php/getAssetGroupList.php", {
			projectkey:curPKey,
			curACat:curAssCat
		},
		function(data) {ass_getAssetGroupList_CB(data)}
	)

	////nProgress()
}

function ass_getAssetGroupList_CB(data) {
	appendStatus(data)
	if (data.AssetGroup != null) {
		var	curAGrp		= getSPKCookie("SPK_AA_CurAssetGroup")

		$("#AA_groupCount").text(data.AssetGroup.length)

		data.AssetGroup.unshift('ALL')
		CreateOptionPair("AA_assetGroupList", data.AssetGroup, data.AssetGroup, '')
		applySPKCookie("SPK_AA_CurAssetGroup", 'AA_assetGroupList', curAGrp)
	}
	else {
		var	all	= new Array();
		all[0]	= "ALL"

		CreateOptionPair("AA_assetGroupList", all, all, '')
		applySPKCookie("SPK_AA_CurAssetGroup", 'AA_assetGroupList', 'ALL')
	}

	ass_getAssetComponentList()

	////endProgress()
}

function ass_getAssetComponentList() {
	var	curProj		= getSPKCookie("SPK_CurProject")
	var	curAssCat	= getSPKCookie("SPK_AA_CurAssetCat")

	////abortExistingAJAX("/php/getAssetComponentList.php");

	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.getJSON(
		"/php/getAssetComponentList.php", {
			pKey:curProj,
			curACat:curAssCat
		},
		function(data) {ass_getAssetComponentList_CB(data)}
	)

	////////inProgress()
}

function ass_getAssetComponentList_CB(data) {
	appendStatus(data)

	if (data.ComponentType != null) {
		var	curAComp	= getSPKCookie("SPK_AA_CurAssetComponent")

		data.ComponentType.unshift('ALL')

		CreateOptionPair("AA_assetComponentList", data.ComponentType, data.ComponentType, '')
		applySPKCookie("SPK_AA_CurAssetComponent", 'AA_assetComponentList', curAComp)
	}
	else {
		var	all	= new Array();
		all[0]	= "ALL"

		setSPKCookie("SPK_AA_CurAssetComponent", all[0])
		CreateOptionPair("AA_assetComponentList", all, all, '')
		applySPKCookie("SPK_AA_CurAssetComponent", 'AA_assetComponentList', 'ALL')
	}

	ass_resetScroll()
	ass_getContent()

	////endProgress()
}

function ass_assignTypeChanged() {
	var	preAssType	= getSPKCookie("SPK_AA_CurAssignType")
	var	curAssType	= $("#AA_assignTypeList").val()
	setSPKCookie("SPK_AA_CurAssignType", "Shot")

	if (preAssType != curAssType) {
		setSPKCookie("SPK_AA_SearchStr", '')
		$("#AA_searchFld").val('')
	}

	ass_getProjectStudioList()

	$("#AA_ShotStatOption").hide()
	$("#AA_AssetStatOption").hide()

	//Rajesh Fithelis
	if ((curAssType=="Asset")) {
		$("#AA_saveBtn").show()
	}
	if ((curAssType=="Shot")) {
		$("#AA_saveBtn").hide()
		//$("#AA_saveBtn").hide()
	}
	//End
	if (curAssType=="Asset") {
		$("#ShotOption").hide()
		$("#AA_playBtn").hide()
		$("#AA_syncRenderBtn").hide()
		$("#AA_syncCompBtn").hide()
		$("#ProjectOption").show()
		$("#AssetOption").show()
		$("#AA_CompTAB").tabs("option", "disabled", false )
		$("#AA_AssetStatOption").show()

		//$("#AA_ShotOptionText1").text("Asset Tag")
		//$("#AA_ShotOptionText2").text("Asset Tag & User")
		applySPKCookie('SPK_AA_MatchAllSelectedComponents', 'AA_TypeListMatchAllSelectedAssetComponentsChkBox', 'FALSE')

		ass_getAssetGroupList()
	}
	else if (curAssType=="Shot") {
		$("#AssetOption").hide()
		$("#ProjectOption").show()
		$("#ShotOption").show()
		$("#AA_syncCompBtn").show()
		$("#AA_CompTAB").tabs("option", "disabled", [1] );
		$("#AA_CompTAB").tabs("option", "active", 0 );

		$("#AA_ShotStatOption").show()

		//$("#AA_ShotOptionText1").text("Episode")
		//$("#AA_ShotOptionText2").text("Episode & User")
		applySPKCookie('SPK_AA_MatchAllSelectedComponents', 'AA_TypeListMatchAllSelectedShotComponentsChkBox', 'FALSE')

		ass_getShotHierarchy()
	}
	else if (curAssType=="Project") {
		$("#AssetOption").hide()
		$("#ShotOption").hide()
		$("#AA_playBtn").hide()
		$("#ProjectOption").show()
		$("#ProjectOption").show()

		ass_resetScroll()
		ass_getContent()
	}
	else {
		$("#ProjectOption").hide()
		$("#AA_playBtn").hide()
		$("#AA_syncRenderBtn").hide()
		$("#AA_syncCompBtn").hide()

		ass_resetScroll()
		ass_getContent()
	}
}

function ass_userChanged() {
	setSPKCookie("SPK_AA_CurUserKey", $("#AA_userList").val())

	ass_resetScroll()
	ass_getContent()
}

function ass_projChanged() {
	var	curPKey		= $("#AA_projList").val()
	setSPKCookie("SPK_CurProject", curPKey)

	setTitle($("#AA_projList option:selected").text())

	var	curAssType	= "Shot"

	ass_getProjectStudioList()
	ass_getUserNameList()

	if (curAssType == "Asset")
		ass_getAssetGroupList()
	else if (curAssType == "Shot")
		ass_getShotHierarchy()
}

function ass_assetCategoryChanged() {
	setSPKCookie("SPK_AA_CurAssetCat", "Shot")

	ass_getAssetGroupList()
}

function ass_assetGroupChanged() {
	setSPKCookie("SPK_AA_CurAssetGroup", $("#AA_assetGroupList").val())

	ass_getAssetComponentList()
}

function ass_assetComponentChanged() {
	setSPKCookie("SPK_AA_CurAssetComponent", $("#AA_assetComponentList").val())

	ass_resetScroll()
	ass_getContent()
}

function ass_shotComponentChanged() {
	var	curPKey		= getSPKCookie("SPK_CurProject")
	var	curSComp	= $("#AA_shotComponentList").val()

	setSPKCookie("SPK_AA_CurShotComp", curSComp)

	if (curSComp=="ALL")
		$("#AA_createShotBtn").hide()
	else if (curPKey != "ALL")
		$("#AA_createShotBtn").show()

	ass_resetScroll()
	ass_getContent()
}

function ass_shotChanged(curLevel) {
	var	curVal	= $("#AA_ShotLevelList" + curLevel).val()
	setSPKCookie(("SPK_AA_ShotLevelNum" + curLevel), curVal)

	if (curVal=='ALL') {
		var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
		for (i=(curLevel+1); i<maxLvl; i++)
			setSPKCookie(("SPK_AA_ShotLevelNum" + i), curVal)
	}

	ass_getShotLevelList(curLevel)
}

function ass_recordsPerPageChanged() {
	setSPKCookie("SPK_AA_RecordsPerPage", $("#AA_recordsPerPageList").val())

	ass_resetScroll()
	ass_getContent()
}

function ass_exactMatch() {
	if ($("#AA_exactMatchChkBox").prop("checked"))
		setSPKCookie("SPK_AA_ExactMatch", 'TRUE')
	else
		setSPKCookie("SPK_AA_ExactMatch", 'FALSE')

	ass_resetScroll()
	ass_getContent()
}

function ass_shotMatch() {
	if ($("#AA_shotMatchChkBox").prop("checked"))
		setSPKCookie("SPK_AA_shotMatch", 'TRUE')
	else
		setSPKCookie("SPK_AA_shotMatch", 'FALSE')

	ass_resetScroll()
	ass_getContent()
}

function ass_checkSave() {
	if (NEED_SAVE) {
		if (confirm("There seems to be unsaved data. Do you want to continue?")) {
			NEED_SAVE	= false
			return	true
		}
		else
			return	false
	}

	return	true
}

function ass_getAssignment(asskeys='') {
	var assignmentidsall = "";
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	curStat	= getSPKCookie("SPK_AA_CurStatus") + ''
	var	curStatList	= curStat.split(",")
	console.log(curStatList)

	var	pKey	= getSPKCookie("SPK_CurProject")
	var	rpp		= getSPKCookie("SPK_AA_RecordsPerPage")

	var	dateOpt	= getSPKCookie("SPK_AA_CurDate")
	var	fromDate= $("#AA_fromDateFld").val()
	var	toDate	= $("#AA_toDateFld").val()

	var	aCat	= getSPKCookie("SPK_AA_CurAssetCat")
	var	aGrp	= getSPKCookie("SPK_AA_CurAssetGroup")
	var	aCompStr= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp	= aCompStr.split(",")

	if (searchArray(aComp, "ALL")>=0)
		aComp	= ["ALL"]

	var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	if (pKey=="ALL")
		maxLvl	= 4
	var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
	var	sComp	= sCompStr.split(",")
	if (searchArray(sComp, "ALL")>=0)
		sComp	= ["ALL"]

	var	shotLevel	= new Array()
	if (pKey=="ALL")
		for (i=0; i<maxLvl; i++)
			shotLevel[i]	= "ALL"
	else {
		for (i=1; i<maxLvl; i++) {
			var	temp		= ""
			temp	+= getSPKCookie("SPK_AA_ShotLevelNum" + i)
			shotLevel[i-1]	= temp.replace(/\,/g, " ")
		}
	}

	var	sStr	= $("#AA_searchFld").val()
	var shotMatch = getSPKCookie("SPK_AA_shotMatch");
	var	eMatch	= getSPKCookie("SPK_AA_ExactMatch")
	//var	sStr	= getSPKCookie("SPK_AA_SearchStr")
	//alert(sStr)

	var	curUser		= getSPKCookie("SPK_AA_CurUserKey");
	var curStudio = getSPKCookie("SPK_AA_CurStudio");
	var orBy		= getSPKCookie("SPK_AA_OrderBy")
	var or			= getSPKCookie("SPK_AA_Order")
	var	page		= getSPKCookie("SPK_AA_Page")
	var	statInv		= getSPKCookie("SPK_AA_CurStatusListInv");
	var	statLast	= getSPKCookie("SPK_AA_CurStatusListLast");
	var	statFirst	= getSPKCookie("SPK_AA_CurStatusListFirst");

	var ignoreH = getSPKCookie("SPK_AA_IgnoreHierarchy");
	if (ignoreH == "") {
		ignoreH = "0";
	}

	//abortExistingAJAX("/php/getAssignment.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	STARTTIME	= new Date();
	console.log('shtlvl',shotLevel)
	cur_AA_AJAX	= $.post(
		"getAssignment", {
			assignment:assType,
			'curStatList[]':curStatList,
			projKey:pKey,
			assetCat:aCat,
			assetGroup:aGrp,
			'assetComp[]':aComp,
			maxLevel:maxLvl,
			'shotComp[]':sComp,
			srchStr:sStr,
			'eMatch':eMatch,
			'shotMatch':shotMatch,
			'studioKey':curStudio,
			recPerPage:rpp,
			uKey:curUser,
			date:dateOpt,
			fDate:fromDate,
			tDate:toDate,
			ignoreH:ignoreH,
			orderBy:orBy,
			order:or,
			pageNum:page,
			'shotLevel[]':shotLevel,
			sInv:statInv,
			sLast:statLast,
			sFirst:statFirst,
			assignmentKeys:assignmentidsall
		},
		function(data) {ass_getAssignment_CB(data)},
		'json'
	)

	////////inProgress()
}

function ass_getAssignment_CB(data){
	console.log('print data',data)
	var mystr = '<table id="AA_ListHeaderTable" class="spk-table2"><thead id="AA_THead"><tr><th colspan="6" class="spk-cell"></th><th colspan="5" class="spk-cell" style="font-size: 20px;">Team Lead</th><th colspan="5" class="spk-cell" style="font-size: 20px;">Supervisor</th><th colspan="5" class="spk-cell" style="font-size: 20px;">Production Manager</th></tr></thead><tbody id="AA_TBody"></tbody></table>'
    console.log('mystr',mystr)
	$("#AA_ListSec").html(mystr)
}



function findValueInArray(value,arr){
  var result = 0;

  for(var i=0; i<arr.length; i++){
    var name = arr[i];
    if(name == value){
      result = 1;
      break;
    }
  }
  return result;
}

function remVideo(fpath, ext) {
	var url	= "remVideo.php"
	url	+= "?filePath=" + fpath
	url	+= "&filext=" + ext
	var	para		= "status=0, menubar=0, titlebar=0, toolbar=0, resizable=1, left=0, top=0, location=0, height=1080, width=1920, fullscreen=1, innerWidth=1920, innerHeight=1080"
	window.open(url, "", para)
}

function rem_PlayVideo(fpath) {
	var url	= "remarksVideo.php"
	url	+= "?filePath='" + fpath +"'"
	var	para		= "status=0, menubar=0, titlebar=0, toolbar=0, resizable=1"
	window.open(url, "", para)
}
/*
Rajesh FithelisTo get Asset status Older or Latest
function getAstSyncStatusAJAX(curAKey, curCompKey){
    var result = null;
	var curPrjKey = getSPKCookie("SPK_CurProject");
    $.ajax({
        url: "php/getAstSyncStatus.php",
        dataType: "json",
        async: false,
        data: {
			pKey: curPrjKey,
			curAssKey: curAKey,
			curComponentKey: curCompKey
		},
        success: function(data){
            result = data.astStatus;
			console.log(data);
        }
    });
	//endProgress();
    return result;
}
*/

/*function syncLatestFinalAstFileAJAX(curAKey, curCompKey){
    var result = null;
	var curPrjKey = getSPKCookie("SPK_CurProject");
	inProgress()
    $.ajax({
        url: "php/syncLatestFinalAstFile.php",
        dataType: "json",
        async: false,
        data: {
			pKey: curPrjKey,
			curAssKey: curAKey,
			curComponentKey: curCompKey
		},
        success: function(data){
			appendStatus(data);
            result = data.astStatus;
			//console.log(data);
			//endProgress()
			assignManager.refresh();
        }
    });
    return result;
}*/

/*
//Rajesh Fithelis
//To Sync The final file using robocopy
function syncLatestFinalAstFileAJAX(curAKey, curCompKey) {
    var result = null;
	var curPrjKey = getSPKCookie("SPK_CurProject");

    if (curAJAX != null)
        curAJAX.abort()

    curAJAX = $.getJSON(
		"php/syncLatestFinalAstFile.php", {
			pKey: curPrjKey,
			curAssKey: curAKey,
			curComponentKey: curCompKey
        },
        function(data) {
			syncLatestFinalAstFileAJAX_CB(data)
			assignManager.refresh();
			}
    )

    inProgress()

}
*/

function syncLatestFinalAstFileAJAX_CB(data) {
	appendStatus(data)
	console.log('syncLatestFinalAstFileAJAX_CB')
	console.log('Data Array:')
//	console.log(data)
    endProgress()
}
//

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';
    //Set Report title in first row or line

    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //Generate a file name
    var fileName = "SPK_XLS_Report_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function ass_exportXLS(){
	console.log('ass_exportXLS: asignment.2.3.js');
    var result = null;
	var curPrjKey = getSPKCookie("SPK_CurProject");
	var curCompType = getSPKCookie("SPK_AA_CurAssetComponent");
	console.log("curCompTypex:");
	console.log(curCompType);

	var	aCompKey	= new Array();
	var	assKeyList	= new Array();
	var rowCnt = 1;
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_");
			aCompKey[aCompKey.length]	= temp[0];
			assKeyList[assKeyList.length]	= temp[1];
		}
		rowCnt++;
	})
	//var sComKeyStr = sCompKey.toString();

    $.ajax({
        url: "php/ass_exportXLS.php",
        dataType: "json",
        async: false,
        data: {
			pKey: curPrjKey,
			compType: curCompType[0],
			'assignmentKeyList[]':assKeyList
		},
        success: function(data){
			//console.log(data);
			JSONToCSVConvertor(data, "XLSReport", true);
			result = data;
			//console.log(data);
        }
    });
    //return result;
}


function ass_getAssignmentGrand() {
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	curStat	= getSPKCookie("SPK_AA_CurStatus") + ''

	var	curStatList	= curStat.split(",")
	var	pKey	= getSPKCookie("SPK_CurProject")
	var	rpp		= getSPKCookie("SPK_AA_RecordsPerPage")

	var	dateOpt	= getSPKCookie("SPK_AA_CurDate")
	var	fromDate= $("#AA_fromDateFld").val()
	var	toDate	= $("#AA_toDateFld").val()

	var	aCat	= getSPKCookie("SPK_AA_CurAssetCat")
	var	aGrp	= getSPKCookie("SPK_AA_CurAssetGroup")
	var	aCompStr= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp	= aCompStr.split(",")
	if (searchArray(aComp, "ALL")>=0)
		aComp	= ["ALL"]

	var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	if (pKey=="ALL")
		maxLvl	= 4
	var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
	var	sComp	= sCompStr.split(",")
	if (searchArray(sComp, "ALL")>=0)
		sComp	= ["ALL"]

	var	shotLevel	= new Array()
	if (pKey=="ALL")
		for (i=0; i<maxLvl; i++)
			shotLevel[i]	= "ALL"
	else
		for (i=1; i<=maxLvl; i++) {
			var	temp		= ""
			temp	+= getSPKCookie("SPK_AA_ShotLevelNum" + i)
			shotLevel[i-1]	= temp.replace(/\,/g, " ")
		}

	var	sStr	= $("#AA_searchFld").val()
	var	eMatch	= getSPKCookie("SPK_AA_ExactMatch")
	var	curUser	= getSPKCookie("SPK_AA_CurUserKey")
	var orBy	= getSPKCookie("SPK_AA_OrderBy")
	var or		= getSPKCookie("SPK_AA_Order")
	var	page	= getSPKCookie("SPK_AA_Page")
	var	statInv	= getSPKCookie("SPK_AA_CurStatusListInv");

	if (assType == "Asset") {
		if (orBy.search("Level")>=0) {
			orBy	= "AssetPrefix"
			setSPKCookie("SPK_AA_OrderBy", orBy)
		}
	}
	else {
		if (orBy.search("Asset")>=0) {
			orBy	= "Level1"
			setSPKCookie("SPK_AA_OrderBy", orBy)
		}
	}

	abortExistingAJAX("getAssignmentGrand");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.post(
		"getAssignmentGrand", {
			assignment:assType,
			'curStatList[]':curStatList,
			projKey:pKey,
			assetCat:aCat,
			assetGroup:aGrp,
			'assetComp[]':aComp,
			maxLevel:maxLvl,
			'shotComp[]':sComp,
			srchStr:sStr,
			'eMatch':eMatch,
			recPerPage:rpp,
			uKey:curUser,
			date:dateOpt,
			fDate:fromDate,
			tDate:toDate,
			orderBy:orBy,
			order:or,
			pageNum:page,
			'shotLevel[]':shotLevel,
			sInv:statInv
		},
		function(data) {ass_getAssignmentGrand_CB(data)},
		'json'
	)

	////////inProgress()
}

function ass_getAssignmentGrand_CB(data) {
	appendStatus(data)
    console.log(data)
	var scr	= $("#AA_TBody").prop("scrollTop")
	if (scr==null)
		scr	= 0;

	$("#AA_pageSec").hide()

	var	pKey	= getSPKCookie("SPK_CurProject")
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	page	= getSPKCookie("SPK_AA_Page")
	var	rpp		= getSPKCookie("SPK_AA_RecordsPerPage")
	var	aComp	= getSPKCookie("SPK_AA_CurAssetComponent")
	var	sComp	= getSPKCookie("SPK_AA_CurShotComp")

	var	numRow	= data.numRow

	$("#AA_assRecordCount").text("Record Count: " + numRow)

	AFFECTED_ROW	= []
//	Need to Update the pagination section

//	if (numRow>rpp) {
//		var	pageMax	= Math.ceil(numRow/rpp)
//
//		var	pStr	= getPageNumStr(page, pageMax, "ass_changePage")
//
//		$("#AA_pageSec").html(pStr)
//		$(".spk-pageBtn").button()
//		$(".spk-selected").css({
//			"background":"#bfdb73",
//			"font-weight":"bold"
//		})
//
//		$("#AA_pageSec").show()
//	}
//	else {
//		$("#AA_pageSec").hide()
//	}

	var	str	= "<table id='AA_ListHeaderTable' class='spk-table2'><thead id='AA_THead'>"

	var	attrSize	= data.AttrList.length

	var	uGrpKey		= getSPKCookie('SPK_CurUserGroupKey')

	// Create Header Row
	str	+= "<tr id='R_MAIN' class='ui-widget-header'>"
	if (assType == "Asset")
		str	+= "<th class='spk-tCell' style='width:18px'><input id='AA_assCheckAllBtn' type='checkbox' onchange='checkAll(\"AA_assCheckAllBtn\")'></input></th>"
	else
		str	+= "<th class='spk-tCell' style='width:41px'><input id='AA_assCheckAllBtn' style='float:left' type='checkbox' onchange='checkAll(\"AA_assCheckAllBtn\")'></input></th>"




	for (i=0; i<data.Component.length; i++) {
		str	+= "<th class='spk-tCell'>"
		str	+= "<button id='ass_" + data.AttrList[i] + "_Btn' class='assBtn ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' "
		console.log(typeof data.Component.length,typeof data.AttrList.length)
		{
		    str	+= "onclick='ass_changeOrder(\"" + data.AttrList[i] + "\")'><b>"+ data.Component[i] + "</b></button>"
		}
	str	+= "</th>"
	}
//		str	+= "onclick='ass_changeOrder(\"" + data.AttrList[i] + "\")'><b>"+ data.Component[i] + "</b></button>"
      for (i=0; i<data.Static.length; i++){
	    str	+= "<th class='spk-tCell'>"
	    str	+= data.Static[i]

	    }
	    str	+= "</th>"
		//str	+= "<th class='spk-tCell' style='width:1em'></th>"




	str		+= "</tr></thead>"
	//hStr	= str + "</table>"
	//str = "<table id='AA_ListTable' class='spk-table2'><tbody id='AA_TBody'>"
	str 	+= "<tbody id='AA_TBody'>"

	var	trArray	= new Array()
	var	keyIdx	= 1;
	trArray[0]	= " spk-row";
	trArray[1]	= " spk-dRow";
	if (assType=="Shot") {
		for (i=1; i<attrSize; i++) {
			if (data.AttrList[i].search("Level") < 0) {
				keyIdx	= (i-1);

				break;
			}
		}
	}

	var	curTR	= 0
	var	preRow	= "#"
	var	curRow	= ""
	var colHeightStr	= "min-height:25px;"
	if (assType == "Asset")
		colHeightStr	= "height:128px;"

	var	end	= 1;
	for (i=2; i<data.AttrList.length; i++) {
		if (data.AttrList[i].match(/Level/g) != null)
			end	= i
	}
    str	+= "</tr></tbody></table>"
    console.log(str)
//    for (j=0; j<data.Data[0].length; j++) {
//		curRow	= data.Data[0][j]
//    }
	$("#AA_GrandSEC").html(str)
	$(".spk-thumbnail3").imageLoader()
	// Populate Data
//	for (j=0; j<data.Data[0].length; j++) {
//		curRow	= data.Data[0][j]
//
//		var	curRKey		= data.Data[0][j]
//		var	curCompKey	= data.Data[1][j]
//		var	curAKey		= data.Data[attrSize-5][j]
//
//		if (curRow != preRow) {
//			preRow	= curRow
//
//			if (j > 0)
//				str		+= "</tr>"
//			str		+= "<tr id='R_"+curRKey+"'"
//
//			if (j==0)
//				str	+= " class='FIRSTROW"
//			else
//				str	+= " class='"
//
//			str		+= trArray[curTR]
//			str		+= "'>"
//			curTR	= (curTR + 1)%2
//
//			str	+= "<td class='spk-tCell'><input type='checkbox' id='AA_assCheckBox" + (j+1) + "' class='spk-check' value='" + curRKey + "' onchange='checkbox_changed(" + (j+1) + ")' onmousedown='mouseDown(\"AA_assCheckBox\", event, " + (j+1) + ")'></input>"
//			//str	+= "</td>"
//			//str	+= "<td class='spk-tCell'>"
//			str	+= "<button id='AS_InfoBtn' class='assBtn' style='width:20px;font-size:x-small' onclick='ass_getComponentInfoContent(\""+curAKey+"\")'><strong>i</strong></button>"
//			str	+= "</td>"
//
//			if (assType == "Asset")
//				str	+= "<td class='spk-iCell' style='width:128px;margin:0px;padding:0px;'><span id='IMG_" + curRKey + "_LP'></span><img id='IMG_" + curRKey + "' class='spk-thumbnail3' src='" + data.Thumbnail[j] + '?sid=' + Math.random() + "'></img></td>"
//
//			for (i=2; i<attrSize-14; i++) {
//				if (data.AttrList[i] == 'ProjectKey')
//					continue
//				// data for each row
//				str	+= "<td class='spk-cell'"
//				if (i==2 || data.AttrList[i].indexOf("Level")>=0) {
//					str	+= " id='C_" + curRKey + "'"
//					str	+= "><strong"
//					if (assType=="Asset") {
//						str	+= ">" + getComponentLinkStr(curCompKey, data.Data[i][j]) + "</strong>"
//						str	+= "<div>" + data.Data[++i][j] + "</div>"
//					}
//					else
//						str	+= ">" + data.Data[i][j] + "</strong>"
//				}
//				else if (data.AttrList[i] == 'AssetTags')
//					str	+= " style='max-width:200px'>" + data.Data[i][j]
//				else
//					str	+= ">" + data.Data[i][j]
//
//				str	+= "</td>"
//			}
//
//			for (i=0; i<data.Component.length; i++) {
//				str	+= "<td id='C_" + curRKey + "_" + data.Component[i] + "_TD' class='spk-cell' style='" + colHeightStr + "padding:0px;margin:0px;'></td>"
//				//str	+= "<td class='spk-cell'></td>"
//			}
//		}
//	}
//
//	str	+= "</tr></tbody></table>"
//
//
//	$("#AA_GrandSEC").html(str)
//	$(".spk-thumbnail3").imageLoader()
//
//	var preRKey	= '#'
//	var	preTask	= '#'
//	var	preComp	= '#'
//	var curAsset
//	var	curTask
//	var curComp
//	tCnt	= 0;
//
//	for (j=0; j<data.Data[0].length; j++) {
//		curRKey		= data.Data[0][j]
//		curCompKey	= data.Data[1][j]
//		//var	temp	= data.Data[attrSize-11][j].split(" ")
//		//curDueDate	= temp[0]
//		curTask		= data.Data[attrSize-12][j]
//		curComp		= data.Data[attrSize-14][j]
//
//		if (curRKey != preRKey) {
//			if (assType=="Shot") {
//				var	temp2	= ""
//				var	sKey	= ""
//				for (i=2; i<=end; i++) {
//					sKey	+= temp2 + data.Data[i][j]
//					temp2	= ":"
//				}
//
//				$("#AA_assCheckBox"+(j+1)).data("SKey", sKey)
//			}
//			else {
//				$("#AA_assCheckBox"+(j+1)).data("SKey", data.Data[2][j])
//
//
//				if (pKey=='ALL') {
//					var	projectKey	= data.Data[5][j]
//					$("#IMG_"+curRKey).data("projectKey", projectKey)				// record the project key
//				}
//				else
//					$("#IMG_"+curRKey).data("projectKey", pKey)						// record the project key
//			}
//		}
//
//		if (curComp != preComp || curRKey != preRKey) {
//			preComp	= curComp
//			preRKey	= curRKey
//
//			var	h	= 100 / tCnt;
//			var hStr	= h + "%"
//
//			$(".spk_temp_cell").each(function(index){
//				if (tCnt>1) {
//					$(this).addClass('spk-cell')
//
//					$(this).css({
//						height:hStr
//					})
//				}
//
//				$(this).removeClass('spk_temp_cell')
//			})
//
//			tCnt	= 0
//		}
//
//		if (j>=data.Data[0].length)
//			break
//
//		var	curAKey			= data.Data[attrSize-5][j]
//		//var	curStatKey		= data.Data[attrSize-4][j]
//		var	remarks			= data.Data[attrSize-6][j]
//
//		var	curCellStr		= "C_" + curRKey + "_" + curComp
//		var curCompCellStr	= curCellStr + "_" + curAKey
//
//		var	sStr	= "<td class='spk_stat_cell spk_temp_cell spk-stat spk-stat-"+data.Data[attrSize-4][j]+"' id='" + curCompCellStr + "'"
//		sStr	+= " title=\""
//		sStr	+= "Task : " + curTask + "&#13;"
//		sStr	+= "Priority: " + data.Data[attrSize-13][j] + "&#13;"
//		sStr	+= "Assign to " + data.Data[attrSize-10][j] + "&#13;"
//		sStr	+= "Update by " + data.Data[attrSize-8][j] + " on " + getDateUTCStr(data.Data[attrSize-9][j]) + "&#13;"
//		if (remarks != "") {
//			remarks	= remarks.replace(/\"/g, "'");
//			remarks	= remarks.replace(/#/g, "&#13");
//			remarks	= remarks.replace(/<b>/g, "");
//			remarks	= remarks.replace(/<\/b>/g, "");
//			sStr	+= "Remarks : " + remarks + "&#13;"
//		}
//		sStr	+= "\">"
//
//		if (curTask != curComp && curTask != "")
//			sStr	+= curTask + " : "
//		sStr	+= data.Data[attrSize-7][j] // task status
//
//		var	grade	= getPriorityGrade(data.Data[attrSize-13][j])
//		sStr 	+= "<span class='spk-ptCell' style='top;float:right;background:"+grade+";'>"+data.Data[attrSize-13][j]+"<span>"
//		sStr	+= "</td>"
//
//		$("#"+curCellStr+"_TD").append(sStr)
//		$("#"+curCellStr+"_TD").addClass('spk-stat spk-stat-'+data.Data[attrSize-4][j])
//
//		$("#"+curCompCellStr).data("MainKey", curRKey)
//		$("#"+curCompCellStr).data("ComponentKey", curCompKey)
//		$("#"+curCompCellStr).data("ComponentType", curComp)
//		$("#"+curCompCellStr).data("AssignmentKey", curAKey)
//		$("#"+curCompCellStr).data("AssignmentName", curTask)
//		$("#"+curCompCellStr).data("AssignTo", data.Data[attrSize-1][j])
//		$("#"+curCompCellStr).data("DueDate", data.Data[attrSize-11][j])
//		$("#"+curCompCellStr).css("cursor", "pointer")
//
//		$("#"+curCompCellStr).on("dblclick", function(e){
//			e.preventDefault()
//		})
//
//		$("#"+curCompCellStr).on("click", function(){
//			CLICK_CNT++;  //count clicks
//
//			var	assType	= getSPKCookie("SPK_AA_CurAssignType")
//			var	key		= $(this).data("ComponentKey")
//			var	curAKey	= $(this).data("AssignmentKey")
//
//			if (CLICK_CNT === 1) {
//				CLICK_TIMER = setTimeout(function() {
//					if (assType=="Shot")
//						ass_getVideo(key)
//					else if (assType=="Asset")
//						ass_openCompImageViewer(key, '', 0)
//					CLICK_CNT = 0;             //after action performed, reset counter
//				}, CLICK_DELAY);
//			}
//			else {
//				clearTimeout(CLICK_TIMER);    //prevent single-click action
//				ass_updateStatus($(this).attr('id'));  //perform double-click action
//				CLICK_CNT = 0;
//			}
//		})
//
//		tCnt++
//	}
//
//	$(".spk_stat_cell").css({
//		width : '100%',
//		padding : '0px',
//		margin : '0px',
//		clear : 'both',
//		'float' : 'left',
//		'font-weight' : 'bold'
//	})
//
//	$(".assBtn").button()
//	$(".spkCheck").val("on")
//
//	$("#AA_TBody").prop("scrollTop", scr)
//
//	var	matchAll	= getSPKCookie("SPK_AA_MatchAllSelectedComponents");
//	// alert(matchAll)
//	if (matchAll=="TRUE"){
//		//console.log("Pruning incomplete rows")
//		ass_pruneIncompleteRows()
//	}
//
//	//$(".spk-thumbnail3").error(function() {checkMissingFile($(this).attr("src"), $(this).attr("id"), 1, $(this).data('projectKey'))})
//
//	//ass_resizeCol()
//	/*
//	 $("#AA_GrandSEC").position({
//	 of: $("#AA_GrandHeaderSEC"),
//	 my: 'left top',
//	 at: 'left bottom',
//	 offset: '0 0'
//	 })*/

	// $("#AA_ProgressSec").hide()
	endProgress()
	////endProgress()
}

function ass_getAssignmentThumbnail() {
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
	var	sComp	= sCompStr.split(",")
	if (searchArray(sComp, "ALL")>=0)
		sComp	= ["ALL"]

	var	aCat	= getSPKCookie("SPK_AA_CurAssetCat")
	var	aGrp	= getSPKCookie("SPK_AA_CurAssetGroup")
	var	aCompStr= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp	= aCompStr.split(",")
	if (searchArray(aComp, "ALL")>=0)
		aComp	= ["ALL"]

	if (assType == 'Asset'){
		for (i in aComp) {
			if (aComp[i] != 'Concept' && aComp[i] != 'Colour' && aComp[i] != 'Turnaround' && aComp[i] != 'Model' && aComp[i] != 'Texture' && aComp[i] != 'Shading' && aComp[i] != 'LightRig' && aComp[i] != 'ALL') {
				$("#AA_THUMBSEC").html('<div><strong>Thumnail is currently only available for Concept, Colour, Model, Texture, Shading and LightRig</strong></div>')
				return
			}
		}
	}
	else {
		for (i in sComp) {
			if (sComp[i] != 'Lighting' && sComp[i] != 'Blocking' && sComp[i] != 'Animation' && sComp[i] != 'ALL') {
				$("#AA_THUMBSEC").html('<div><strong>Thumnail is currently only available for Blocking, Animation and Lighting</strong></div>')
				return
			}
		}
	}

	var	curStat	= getSPKCookie("SPK_AA_CurStatus") + ''

	var	curStatList	= curStat.split(",")

	var	pKey	= getSPKCookie("SPK_CurProject")
	var	rpp		= getSPKCookie("SPK_AA_RecordsPerPage")

	var	dateOpt	= getSPKCookie("SPK_AA_CurDate")
	var	fromDate= $("#AA_fromDateFld").val()
	var	toDate	= $("#AA_toDateFld").val()

	var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	if (pKey=="ALL")
		maxLvl	= 4

	var	shotLevel	= new Array()
	if (pKey=="ALL")
		for (i=0; i<maxLvl; i++)
			shotLevel[i]	= "ALL"
	else
		for (i=1; i<=maxLvl; i++) {
			var	temp		= ""
			temp	+= getSPKCookie("SPK_AA_ShotLevelNum" + i)
			shotLevel[i-1]	= temp.replace(/\,/g, " ")
		}

	var	sStr	= $("#AA_searchFld").val()
	var	eMatch	= getSPKCookie("SPK_AA_ExactMatch")
	var	curUser	= getSPKCookie("SPK_AA_CurUserKey")
	var orBy	= getSPKCookie("SPK_AA_OrderBy")
	var or		= getSPKCookie("SPK_AA_Order")
	var	page	= getSPKCookie("SPK_AA_Page")
	var	statInv	= getSPKCookie("SPK_AA_CurStatusListInv");

	abortExistingAJAX("/php/getAssignmentThumbnail.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.post(
		"/php/getAssignmentThumbnail.php", {
			assignment:assType,
			'curStatList[]':curStatList,
			projKey:pKey,
			assetCat:aCat,
			assetGroup:aGrp,
			maxLevel:maxLvl,
			'assetComp[]':aComp,
			'shotComp[]':sComp,
			srchStr:sStr,
			'eMatch':eMatch,
			recPerPage:rpp,
			uKey:curUser,
			date:dateOpt,
			fDate:fromDate,
			tDate:toDate,
			orderBy:orBy,
			order:or,
			pageNum:page,
			'shotLevel[]':shotLevel,
			sInv:statInv
		},
		function(data) {ass_getAssignmentThumbnail_CB(data)},
		'json'
	)

	////////inProgress()
}

function ass_getAssignmentThumbnail_CB(data) {
	appendStatus(data)

	var scr	= $("#AA_THUMBSEC").prop("scrollTop")
	if (scr==null)
		scr	= 0;

	$("#AA_pageSec").hide()

	var	width		= $("#AA_THUMBSEC").width()
	var	cCount		= Math.floor(width/240)
	var	wPencent	= 100/cCount

	var	size		= data.Data[0].length
	var	attrSize	= data.Data.length
	var	blkFile		= 'img/BlankImage128.jpg'

	var	numRow		= data.numRow
	var	pKey		= getSPKCookie("SPK_CurProject")
	var	page		= getSPKCookie("SPK_AA_Page")
	var	rpp			= getSPKCookie("SPK_AA_RecordsPerPage")
	var	assType		= getSPKCookie("SPK_AA_CurAssignType")

	$("#AA_assRecordCount").text("Record Count: " + numRow)

	if (numRow>size) {
		var	pageMax	= Math.ceil(numRow/rpp)

		var	pStr	= getPageNumStr(page, pageMax, "ass_changePage")

		$("#AA_pageSec").html(pStr)
		$(".spk-pageBtn").button()
		$(".spk-selected").css({
			"background":"#bfdb73",
			"font-weight":"bold"
		})

		$("#AA_pageSec").show()
	}
	else {
		$("#AA_pageSec").hide()
	}

	var	tmpHeader	= ''
	var	tmpRow		= ''

	var	str	= "<table class='spk-table2'><tbody>"
	if (assType == 'Asset') {
		var	resizeCode	= "http://"+getSPKCookie("SPK_SPKNET")+"/image.php?width=240&image="

		for (i=0; i<size; i++) {
			if ((i%cCount)==0 && i != 0) {
				str	+= "<tr class='ui-widget-header'>" + tmpHeader + "</tr>"
				str	+= "<tr>" + tmpRow + "</tr>"

				tmpHeader	= ''
				tmpRow		= ''
			}

			tmpHeader	+= "<th class='spk-tCell' style='border-right-width:0px'>"
			tmpHeader	+= "<input type='checkbox' id='AA_assCheckBox" + (i+1) + "' class='spk-check' value='" + data.Data[1][i] +"_" + data.Data[0][i] + "' onchange='checkbox_changed(" + (i+1) + ")' onmousedown='mouseDown(\"AA_assCheckBox\", event, " + (i+1) + ")' style='float:left'></input>"
			tmpHeader	+= "</th><th class='spk-tCell' style='border-right-width:0px'>"
			tmpHeader	+= getComponentLinkStr(data.Data[1][i], data.Data[2][i]) + " [" + data.Data[4][i] + "]"
			tmpHeader	+= "</th><th class='spk-tCell'>"
			tmpHeader	+= "<button id='AS_InfoBtn' class='assBtn' onclick='ass_getComponentInfoContent(\"" + data.Data[0][i] + "\")' style='float:right'><strong>i</strong></button>"
			tmpHeader	+= "</th>"

			var	image	= data.Data[5][i]
			tmpRow	+= "<td id='AA_IMG_" + data.Data[0][i] + "_C' class='spk-iCell' colspan=3 style='width:"+wPencent+"%'>"
			//if (image != '')
			tmpRow	+= "<img class='spk-thumbnail5' style='width:99%;max-width:100%' id='AA_IMG_" + data.Data[0][i] + "' src='" + resizeCode + encodeURIComponent(image) + "' alt='" + image + "' onclick='ass_openCompImageViewer(\"" + data.Data[1][i] + "\", \"\", \"0\")'></img>"
			//else
			//tmpRow	+= "<img class='spk-thumbnail5' src='img/BlankImage128.jpg'></img>"
			tmpRow	+= "</td>"
		}

		if (tmpHeader != '') {
			tmpHeader	+= "<th class='spk-tCell' colspan=" + (3*cCount-i%cCount) + "></th>"
			tmpRow		+= "<td class='spk-tCell' colspan=" + (3*cCount-i%cCount) + "></td>"

			str	+= "<tr class='ui-widget-header'>" + tmpHeader + "</tr>"
			str	+= "<tr>" + tmpRow + "</tr>"
		}
	}
	else if (assType == 'Shot') {
		var	resizeCode	= "http://"+getSPKCookie("SPK_SPKNET")+"/image.php?width=240&heigh=135&image="

		for (i=0; i<size; i++) {
			if ((i%cCount)==0 && i != 0) {
				str	+= "<tr class='ui-widget-header'>" + tmpHeader + "</tr>"
				str	+= "<tr>" + tmpRow + "</tr>"

				tmpHeader	= ''
				tmpRow		= ''
			}

			tmpHeader	+= "<th class='spk-tCell' style='border-right-width:0px'>"
			tmpHeader	+= "<input type='checkbox' id='AA_assCheckBox" + (i+1) + "' class='spk-check' value='" + data.Data[2][i] + "' onchange='checkbox_changed(" + (i+1) + ")' onmousedown='mouseDown(\"AA_assCheckBox\", event, " + (i+1) + ")' style='float:left'></input>"
			tmpHeader	+= "</th><th class='spk-tCell' style='border-right-width:0px'>"
			tmpHeader	+= data.Data[1][i] + " [" + data.Data[attrSize-2][i] + "]"
			tmpHeader	+= "</th><th class='spk-tCell'>"
			tmpHeader	+= "<button id='AS_InfoBtn' class='assBtn' onclick='ass_getComponentInfoContent(\"" + data.Data[0][i] + "\")' style='float:right'><strong>i</strong></button>"
			tmpHeader	+= "</th>"

			var	sFile	= data.Data[(attrSize-6)][i]
			var	eFile	= data.Data[(attrSize-5)][i]
			var	sNFile	= data.Data[(attrSize-4)][i]
			var	eNFile	= data.Data[(attrSize-3)][i]

			tmpRow	+= "<td class='spk-iCell' colspan=3 style='width:"+wPencent+"%'>"
			if (sFile != '')
				tmpRow	+= "<span id='AA_IMG_" + data.Data[0][i] + "s_LP'></span><img class='spk-thumbnail5' id='AA_IMG_" + data.Data[0][i] + "s' src='" + resizeCode + encodeURIComponent(sFile) + "' alt='" + sFile + "' onclick='ass_openImage(\"" + sNFile + "\")' class='spk-img'></img>"
			if (eFile != '')
				tmpRow	+= "<span id='AA_IMG_" + data.Data[0][i] + "e_LP'></span><img class='spk-thumbnail5' id='AA_IMG_" + data.Data[0][i] + "e' src='" + resizeCode + encodeURIComponent(eFile) + "' alt='" + eFile + "' onclick='ass_openImage(\"" + eNFile + "\")' class='spk-img'></img>"
			tmpRow	+= "</td>"
		}

		if (tmpHeader != '') {
			tmpHeader	+= "<th class='spk-tCell' colspan=" + (3*cCount-i%cCount) + "></th>"
			tmpRow		+= "<td class='spk-tCell' colspan=" + (3*cCount-i%cCount) + "></td>"

			str	+= "<tr class='ui-widget-header'>" + tmpHeader + "</tr>"
			str	+= "<tr>" + tmpRow + "</tr>"
		}
	}
	str	+= '</tbody></table>'

	$("#AA_THUMBSEC").html(str)
	$(".spk-thumbnail5").imageLoader()

	$("#AA_THUMBSEC").prop("scrollTop", scr)

	for (i=0; i<size; i++) {
		$("#AA_assCheckBox"+(i+1)).data("SKey", data.Data[2][i])

		var	projectKey	= data.Data[(data.Data.length-1)][i]
		if (pKey!='ALL')
			projectKey	= pKey

		if (assType == 'Asset')
			$("#AA_IMG_"+data.Data[0][i]).data("projectKey", projectKey)				// record the project key
		else {
			$("#AA_IMG_"+data.Data[0][i]+"s").data("projectKey", projectKey)						// record the project key
			$("#AA_IMG_"+data.Data[0][i]+"e").data("projectKey", projectKey)						// record the project key
		}
	}

	//$(".spk-thumbnail5").error(function() {checkMissingFile($(this).attr("src"), $(this).attr("id"), 1, $(this).data('projectKey'))})

	$(".assBtn").button()

	// $("#AA_ProgressSec").hide()
	endProgress()
	////endProgress()
}

function ass_getAssignmentStat() {
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	curStat	= getSPKCookie("SPK_AA_CurStatus") + ''

	var	curStatList	= curStat.split(",")
	var	pKey	= getSPKCookie("SPK_CurProject")

	var	dateOpt	= getSPKCookie("SPK_AA_CurDate")
	var	fromDate= $("#AA_fromDateFld").val()
	var	toDate	= $("#AA_toDateFld").val()

	var	aCat	= getSPKCookie("SPK_AA_CurAssetCat")
	var	aGrp	= getSPKCookie("SPK_AA_CurAssetGroup")
	var	aCompStr= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp	= aCompStr.split(",")
	if (searchArray(aComp, "ALL")>=0)
		aComp	= ["ALL"]

	var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	if (pKey=="ALL")
		maxLvl	= 3
	var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
	var	sComp	= sCompStr.split(",")
	if (searchArray(sComp, "ALL")>=0)
		sComp	= ["ALL"]

	//var	sRel	= getSPKCookie("SPK_AA_ShowRelated")

	var	shotLevel	= new Array()
	if (pKey=="ALL")
		for (i=0; i<maxLvl; i++)
			shotLevel[i]	= "ALL"
	else
		// for (i=1; i<=maxLvl; i++) { // bugfix for previous project levels contamination
		for (i=1; i < maxLvl; i++) {
			var	temp		= ""
			temp	+= getSPKCookie("SPK_AA_ShotLevelNum" + i)
			shotLevel[i-1]	= temp.replace(/\,/g, " ")
		}

	var	sStr		= $("#AA_searchFld").val()
	var	eMatch		= getSPKCookie("SPK_AA_ExactMatch")
	var	curUser		= getSPKCookie("SPK_AA_CurUserKey")
	var curStudio   = getSPKCookie("SPK_AA_CurStudio");
	var orBy		= getSPKCookie("SPK_AA_OrderBy")
	var or			= getSPKCookie("SPK_AA_Order")
	var	statInv		= getSPKCookie("SPK_AA_CurStatusListInv")
	var	statOp		= getSPKCookie("SPK_AA_CurStatOption")
	var	statAssetTag= getSPKCookie("SPK_AA_CurStatAssetTag")
	var	statUser	= getSPKCookie("SPK_AA_CurStatUser")

	abortExistingAJAX("/php/getAssignmentStat.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.post(
		"/php/getAssignmentStat.php", {
			assignment:assType,
			'curStatList[]':curStatList,
			projKey:pKey,
			assetCat:aCat,
			assetGroup:aGrp,
			'assetComp[]':aComp,
			maxLevel:maxLvl,
			'shotComp[]':sComp,
			srchStr:sStr,
			'eMatch':eMatch,
			'studioKey':curStudio,
			uKey:curUser,
			date:dateOpt,
			fDate:fromDate,
			tDate:toDate,
			orderBy:orBy,
			order:or,
			'shotLevel[]':shotLevel,
			sInv:statInv,
			sOp:statOp,
			sATag:statAssetTag,
			sUser:statUser
		},
		function(data) {ass_getAssignmentStat_CB(data)},
		'json'
	)

	////////inProgress()
}

function ass_getAssignmentStat_CB(data) {
	appendStatus(data)
	var STARTTIME	= new Date();

	var scr	= $("#AA_STATSEC").prop("scrollTop")
	if (scr==null)
		scr	= 0;

	var	width		= $("#AA_STATSEC").width() - 30
	var	cCount		= Math.floor(width/300)
	var	wPencent	= 100/cCount
	var	cWidth		= width/cCount
	var cHeight		= 2*cWidth/3

	var	attrSize	= data.AttrList.length
	var	dataSize	= data.Data[0].length

	var	statOp		= getSPKCookie("SPK_AA_CurStatOption")
	var	statAssetTag= getSPKCookie("SPK_AA_CurStatAssetTag")
	var	statUser	= getSPKCookie("SPK_AA_CurStatUser")

	if (data.Data.length > 0) {
		var	preGroup	= data.Data[1][0]
		var	tempPre		= preGroup
		console.log("PRE_GROUP:"+preGroup)
		if(!tempPre){tempPre = ""}

		var	isTitle	= 0
		for (i=2; i<attrSize-4; i++) {
			isTitle	= 1
			preGroup += "_" + data.Data[i][0]
		}

		for (i=2; i<attrSize-5; i++)  {
			tempPre += "_" + data.Data[i][0]
		}

		var	cnt			= 0
		var	sum			= 0
		var	tSum		= 0

		var	seriesData	= new Array();
		var	statData	= new Array();
		var	sumList		= new Array();
		var	section		= new Array()

		var	hStr		= ""
		var	mStr		= "<table class='spk-table2'><tbody>"
		if (isTitle) {
			var	tempPreStr	= tempPre.replace(/_/g, " : ")
			tempPre			= tempPre.replace(/ /g, "_")
			tempPre			= tempPre.replace(/\'/g, "_")
			tempPre			= tempPre.replace(/!/g, "_")
			tempPre			= tempPre.replace(/\(/g, "\\(")
			tempPre			= tempPre.replace(/\)/g, "\\)")
			hStr	= "<tr class='ui-widget-header'><th class='spk-cell' id='"+tempPre+"_Title' style='font-size:1.2em;padding:4px' colspan=" + cCount+ ">"+tempPreStr+" - (<strong id='Sum"+tempPre+"'></strong>)</th></tr>"
			mStr		+= hStr

			section[section.length]	= tempPre
		}

		var	chCount	= 0;
		var	Charts	= new Array();
		var	cCnt	= 0
		for (j=0; j<=dataSize; j++) {
			var	curGroup	= data.Data[1][j];
			for (i=2; i<attrSize-4; i++)
				curGroup += "_" + data.Data[i][j];

			if (preGroup != curGroup) {
				var preArr	= preGroup.split("_")
				var curArr	= preArr
				if (curGroup != null)
					curArr	= curGroup.split("_")

				var sec	= preGroup + "Sec"
				if (cCnt==cCount) {
					cCnt	= 0
					if (j>0)
						mStr	+= "</tr>"
				}

				if (cCnt==0)
					mStr	+= "<tr>"
				var	title	= preArr[preArr.length-1] + ' (' + sum + ')'
				var	str	= "<td class='spk-tCell' style='text-align:center;width:"+wPencent+"%;'><div class='ui-widget-header' style='border-width:0px;text-align:left;padding:0.2em 0.4em'>"+title+"</div><div id='" + sec + "' style='padding:1px;text-align:center;'></div></td>";
				mStr	+= str
				cCnt++

				Charts[chCount] = {
					chart: {
						borderWidth : 0,
						renderTo: sec,
						margin: [5, 5, 5, 5],
						plotBackgroundColor: '#ceea82',
						backgroundColor : '#ceea82',
						plotBorderWidth: 0,
						plotShadow: false,
						height: cHeight,
						width: cWidth,
						reflow: true
					},
					title: {
						text: '',
					},
					tooltip: {
						formatter: function() {
							return '<b>'+ this.point.name + ' : ' + this.y + '</b> (' + (Math.round(this.percentage*100)/100) +'%)';
						}
					},
					plotOptions: {
						pie: {
							animation : true,
							borderWidth : 0,
							selected: true,
							shadow: false,
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								distance: 5,
								enabled: true,
								color: '#5e6a3b',
								connectorColor: '#5e6a3b',
								connectorWidth: 0.5,
								softConnector : false,
								style : {
									'textShadow' : '',
									'fontWeight' : 'normal'
								},
								formatter: function() {
									return '<b>' + this.y + '</b> (' + (Math.round(this.percentage*100)/100) + '%)';
								}
							}
						}
					},
					series: []
				}

				seriesData[chCount].name	= preGroup
				seriesData[chCount].type	= 'pie'
				Charts[chCount].series.push(seriesData[chCount])
				chCount++

				var	newPre	= preGroup.replace("_"+preArr[preArr.length-1], "")
				var	tempCur	= ''
				if (curGroup != null)
					tempCur	= curGroup.replace("_"+curArr[curArr.length-1], "")

				$("#Sum"+tempPre).text(tSum)

				sumList[tempPre]	= tSum

				if (newPre != tempCur && j!=dataSize) {
					if (isTitle) {
						tSum	= 0

						var	tempCurStr	= tempCur.replace(/_/g, " : ")
						tempCur			= tempCur.replace(/ /g, "_")
						tempCur			= tempCur.replace(/\'/g, "_")
						tempCur			= tempCur.replace(/!/g, "_")
						tempCur			= tempCur.replace(/\(/g, "\\(")
						tempCur			= tempCur.replace(/\)/g, "\\)")
						hStr	= "</tr><tr class='ui-widget-header'><th class='spk-cell' id='"+tempCur+"Title' style='font-size:1.2em;padding:4px' colspan=" + cCount+ ">"+tempCurStr+" - (<strong id='Sum"+tempCur+"'></strong>)</th></tr>"
						mStr	+= hStr
						section[section.length]	= tempCur
						tempPre	= tempCur
						cCnt	= 0
					}
				}

				preGroup 	= curGroup
				cnt			= 0
				sum			= 0
			}

			if (cnt==0)
				seriesData[chCount]	= {data:[]}

			seriesData[chCount].data[cnt] = {
				name	: data.Data[attrSize-4][j],
				y		: parseInt(data.Data[0][j]),
				color	: data.Data[attrSize-2][j]
			}

			sum		+= parseInt(data.Data[0][j])
			tSum	+= parseInt(data.Data[0][j])

			cnt++
		}
		mStr	+= "</tbody></table>"
		$("#AA_STATSEC").html(mStr)
	}

	for (idx in section) {
		$("#Sum"+section[idx]).text(sumList[section[idx]])
	}

	for (idx in Charts) {
		var newChart = new Highcharts.Chart(Charts[idx])
	}

	$("#AA_STATSEC").prop("scrollTop", scr)

	// $("#AA_ProgressSec").hide()
	endProgress()
	////endProgress()
	var	curTime	= new Date()
	var	timeDiff	= curTime - STARTTIME
	setStatusMessage("MAKE STATISTIC VIEW : "+timeDiff/1000 + ' seconds : FOR '+ Charts.length +' CHARTS')
}

function ass_getAssignmentProg() {
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	curStat	= getSPKCookie("SPK_AA_CurStatus") + ''

	var	curStatList	= curStat.split(",")
	var	pKey	= getSPKCookie("SPK_CurProject")

	var	dateOpt	= getSPKCookie("SPK_AA_CurDate")
	var	fromDate= $("#AA_fromDateFld").val()
	var	toDate	= $("#AA_toDateFld").val()

	var	aCat	= getSPKCookie("SPK_AA_CurAssetCat")
	var	aGrp	= getSPKCookie("SPK_AA_CurAssetGroup")
	var	aCompStr= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp	= aCompStr.split(",")
	if (searchArray(aComp, "ALL")>=0)
		aComp	= ["ALL"]

	var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	if (pKey=="ALL")
		maxLvl	= 3
	var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
	var	sComp	= sCompStr.split(",")
	if (searchArray(sComp, "ALL")>=0)
		sComp	= ["ALL"]

	var	shotLevel	= new Array()
	if (pKey=="ALL")
		for (i=0; i<maxLvl; i++)
			shotLevel[i]	= "ALL"
	else
		for (i=1; i<=maxLvl; i++) {
			var	temp		= ""
			temp	+= getSPKCookie("SPK_AA_ShotLevelNum" + i)
			shotLevel[i-1]	= temp.replace(/\,/g, " ")
		}

	var	sStr	= $("#AA_searchFld").val()
	var	eMatch	= getSPKCookie("SPK_AA_ExactMatch")
	var	curUser	= getSPKCookie("SPK_AA_CurUserKey")
	var orBy	= getSPKCookie("SPK_AA_OrderBy")
	var or		= getSPKCookie("SPK_AA_Order")
	var	statInv	= getSPKCookie("SPK_AA_CurStatusListInv");

	abortExistingAJAX("/php/getAssignmentProg.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.post(
		"/php/getAssignmentProg.php", {
			assignment:assType,
			'curStatList[]':curStatList,
			projKey:pKey,
			assetCat:aCat,
			assetGroup:aGrp,
			'assetComp[]':aComp,
			maxLevel:maxLvl,
			'shotComp[]':sComp,
			srchStr:sStr,
			'eMatch':eMatch,
			uKey:curUser,
			date:dateOpt,
			fDate:fromDate,
			tDate:toDate,
			orderBy:orBy,
			order:or,
			'shotLevel[]':shotLevel,
			sInv:statInv
		},
		function(data) {ass_getAssignmentProg_CB(data)},
		'json'
	)

	////////inProgress()
}

function ass_getAssignmentProg_CB(data) {
	appendStatus(data)

	var	attrSize	= data.AttrList.length
	var	dataSize	= data.Data[0].length

	$("#AA_PROGSEC").empty()

	if (data.Data.length > 0) {
		var	preGroup	= data.Data[1][0]
		for (i=2; i<attrSize-5; i++)
			preGroup += "_" + data.Data[i][0]

		var	preStatus	= data.Data[attrSize-4][0]

		var	SCnt		= 0
		var	cnt			= 0

		var	seriesData		= new Array()
		seriesData[0]		= new Object()
		seriesData[0].data	= new Array()
		seriesData[0].name	= preStatus
		seriesData[0].color	= data.Data[attrSize-2][0]

		var	statData		= new Array()
		var curGroup, sec, str, title, curStatus
		var max	= 0;

		for (j=0; j<=dataSize; j++) {
			curGroup	= data.Data[1][j]
			for (i=2; i<attrSize-5; i++)
				curGroup += "_" + data.Data[i][j]

			curStatus	= data.Data[attrSize-4][j]

			if (preGroup != curGroup) {
				sec	= preGroup + "Sec"
				str	= "<div id='" + sec + "' style='float:left'></div>"
				title	= preGroup
				$("#AA_PROGSEC").append(str)

				for (k=0; k<seriesData.length;k++)
					if (seriesData[k].data.length>max)
						max	= seriesData[k].data.length

				var newChart = {
					chart: {
						borderWidth : 1,
						renderTo: sec,
						plotBackgroundColor: '#ceea82',
						backgroundColor : '#ceea82',
						plotBorderWidth: 0,
						plotShadow: false,
						height: 400,
						width: 800,
						reflow: true,
						type: 'column'
					},
					title: {
						text: title,
						align: 'left',
						style: {
							color: '#31371f',
							fontSize: 'small'
						}
					},
					xAxis: {
						type: 'datetime',
						dateTimeLabelFormats: { // don't display the dummy year
							month: '%b',
							year: '%Y'
						}
					},
					yAxis: {
						title: {
							text: 'Count'
						},
						min: 0
					},
					plotOptions: {
						column: {
							animation : false,
							stacking: 'normal',
							borderWidth: 0,
							pointWidth: 10,
							shadow:0,
							allowPointSelect: true,
							cursor: 'pointer'
						}
					},
					series: []
				}

				newChart.series = seriesData
				var chart = new Highcharts.Chart(newChart)

				seriesData			= []
				seriesData[0]		= new Object()
				seriesData[0].data	= new Array()
				seriesData[0].name	= curStatus
				seriesData[0].color	= data.Data[attrSize-2][j]
				preGroup 			= curGroup
				preStatus			= curStatus
				cnt					= 0
				SCnt				= 0
				max					= 0
			}

			if (j==dataSize)
				break;

			if (preStatus != curStatus) {
				preStatus	= curStatus

				SCnt++

				seriesData[SCnt]		= new Object()
				seriesData[SCnt].data	= new Array()
				seriesData[SCnt].name	= curStatus
				seriesData[SCnt].color	= data.Data[attrSize-2][j]
				cnt						= 0
			}

			var	temp	= data.Data[attrSize-5][j]
			var	dateArr	= temp.split("-")
			var	date	= Date.UTC(parseInt(dateArr[0]), parseInt(dateArr[1])-1, parseInt(dateArr[2]))
			var	val		= parseInt(data.Data[0][j])

			seriesData[SCnt].data[cnt] = [date, val]
			cnt++
		}
	}

	// $("#AA_ProgressSec").hide()
	endProgress()
	////endProgress()
}

function ass_getAssignmentTaskLoad() {
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	assCal	= getSPKCookie("SPK_AA_CalendarOption")
	var	assData	= getSPKCookie("SPK_AA_DataOption")
	var	assMode	= getSPKCookie("SPK_AA_ModeOption")
	var	curStat	= getSPKCookie("SPK_AA_CurStatus") + ''

	if (assType=="Asset")
		if (assData=="FrameCount" || assData=="Seconds") {
			assData	= "TaskCount"
			setSPKCookie("SPK_AA_DataOption", assData)
			$("#AA_DataOptionList").val(assData)
		}

	var	curStatList	= curStat.split(",")
	var	pKey	= getSPKCookie("SPK_CurProject")

	var	fromDate= $("#AA_fromDateFld").val()
	var	toDate	= $("#AA_toDateFld").val()

	var today	= new Date();
	if (fromDate=='') {
		fromDate	= today.getFullYear() + "-" + padding((today.getMonth()),2) + "-" + padding(today.getDate(),2)
		$("#AA_fromDateFld").val(fromDate)
	}
	if (toDate=='') {
		toDate	= today.getFullYear() + "-" + padding((today.getMonth()+1),2) + "-" + padding(today.getDate(),2)
		$("#AA_toDateFld").val(toDate)
	}

	var	aCat	= getSPKCookie("SPK_AA_CurAssetCat")
	var	aCompStr= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp	= aCompStr.split(",")
	if (searchArray(aComp, "ALL")>=0)
		aComp	= ["ALL"]

	var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
	var	sComp	= sCompStr.split(",")
	if (searchArray(sComp, "ALL")>=0)
		sComp	= ["ALL"]

	var	curUser	= getSPKCookie("SPK_AA_CurUserKey");
	var	curStudio	= getSPKCookie("SPK_AA_CurStudio");
	var	statInv	= getSPKCookie("SPK_AA_CurStatusListInv");

	abortExistingAJAX("/php/getAssignmentTaskLoad.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.post(
		"/php/getAssignmentTaskLoad.php", {
			assignment:assType,
			cal:assCal,
			dat:assData,
			mode:assMode,
			'curStatList[]':curStatList,
			projKey:pKey,
			assetCat:aCat,
			'assetComp[]':aComp,
			'shotComp[]':sComp,
			uKey:curUser,
			studioKey:curStudio,
			fDate:fromDate,
			tDate:toDate,
			sInv:statInv
		},
		function(data) {ass_getAssignmentTaskLoad_CB(data)},
		'json'
	)

	////////inProgress()
}

function ass_getAssignmentTaskLoad_CB(data) {
	appendStatus(data)

	$("#AA_TASKLOADSEC").empty()

	var scr	= $("#AA_TASKLOADSEC").prop("scrollTop")
	if (scr==null)
		scr	= 0;

	$("#AA_pageSec").hide()

	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	pKey	= getSPKCookie("SPK_CurProject")
	var	assCal	= getSPKCookie("SPK_AA_CalendarOption")
	var	assMode	= getSPKCookie("SPK_AA_ModeOption")
	var	page	= getSPKCookie("SPK_AA_Page")
	var	rpp		= getSPKCookie("SPK_AA_RecordsPerPage")
	var	aCat	= getSPKCookie("SPK_AA_CurAssetCat")
	var	aComp	= getSPKCookie("SPK_AA_CurAssetComponent")
	var	sComp	= getSPKCookie("SPK_AA_CurShotComp")

	var	Data	= data.Data

	if (data.numrow > 0) {
		var	sDate	= new Array()
		sDate	= sDate.concat(Data['Update'+assCal])
		sDate	= sDate.sort()
		var	temp	= sDate[0].split('-')

		var	str		= "<table id='AA_ListHeaderTable' class='spk-table2'><thead id='AA_THead'><tr class='ui-widget-header'>"
		var	attrSize	= data.AttrList.length

		str	+= "<th class='spk-tCell'>" + data.AttrList[0] + "</th>"
		var	cellArr	= new Array();
		if (assCal=="Date") {
			var	temp	= sDate[0].split('-')
			var	stDate	= new Date(temp[0],temp[1]-1,temp[2],0,0,0,0)
			temp	= sDate[sDate.length-1].split('-')
			var	edDate	= new Date(temp[0],temp[1]-1,temp[2],0,0,0,0)

			var	crDate	= edDate;
			while (crDate>=stDate) {
				str	+= "<th class='spk-tCell'>"+crDate.toDateString()+"</th>"
				cellArr[cellArr.length]	= crDate.getFullYear() + '-' + padding(crDate.getMonth()+1, 2) + '-' + padding(crDate.getDate(),2)
				crDate.setDate(crDate.getDate()-1)
			}
		}
		else if (assCal=="Week") {
			for (i=sDate[sDate.length-1]; i>=sDate[0]; i--) {
				str	+= "<th class='spk-tCell'>"+i+"</th>"
				cellArr[cellArr.length]	= i
			}
		}
		else if (assCal=="Month") {
			var	mth	= ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
			for (i=sDate[sDate.length-1]; i>=sDate[0]; i--) {
				str	+= "<th class='spk-tCell'>"+mth[i-1]+"</th>"
				cellArr[cellArr.length]	= i
			}
		}
		str	+= "</tr></thead><tbody id='AA_TBody'>"

		var	users	= removeArrayDuplicate(Data[data.AttrList[0]])

		var	trArray	= ["spk-row", "spk-dRow"]

		for (i=0; i<users.length; i++) {
			str	+= "<tr id='"+users[i].replace(/\s/g, "")+"' class='"+trArray[i%2]+"'>"
			str	+= "<td class='spk-cell'>"+users[i]+"</td>"
			for (j=0; j<cellArr.length; j++)
				str	+= "<td class='spk-sCell'><table id='"+users[i].replace(/\s/g, "")+"_"+cellArr[j]+"' class='spk-table2'>"+"</table></td>"
			str	+= "</tr>"
		}

		str	+= "</tbody></table>"
		$("#AA_TASKLOADSEC").html(str)

		var	isProj = isACat = isComp = 0
		if (Data['Project'] != null)
			isProj	= 1

		if (assType=="Asset" && Data['AssetCategory'] != null)
			isACat	= 1

		if (Data['Component'] != null)
			isComp	= 1

		var	size	= Data[data.AttrList[0]].length
		for (i=0; i<size; i++) {
			var	curName	= Data['User'][i].replace(/\s/g, "")
			var	curLab	= ""

			if (assMode==0) {
				curLab	= "<td class='spk-cell'><b>"
				if (isProj) {
					curName	+= "_" + Data['Project'][i]
					curLab	+= " " + Data['Project'][i]
				}
				if (isACat) {
					curName	+= "_" + Data['AssetCategory'][i]
					curLab	+= " " + Data['AssetCategory'][i]
				}
				if (isComp) {
					curName	+= "_" + Data['Component'][i]
					curLab	+= " " + Data['Component'][i]
				}
				curLab	+= "</b></td>"
			}
			curName	+= Data["Update"+assCal][i]
			stStr	= "<td id='"+curName+"_"+Data['StatusKey'][i]+"' class='spk-cell spk-stat spk-stat-"+Data['StatusKey'][i]+"'>" +Data['Data'][i]+ "</td>"

			var	curRow	= curName + "_R"
			if ($("#"+curRow).length==0) {
				str	= "<tr id='"+curRow+"'>" + curLab + stStr + "</tr>"
				$("#"+Data['User'][i].replace(/\s/g, "")+"_"+Data["Update"+assCal][i]).append(str)
			}
			else {
				$("#"+curRow).append(stStr)
			}
		}
	}

	$("#AA_TASKLOADSEC").prop("scrollTop", scr)
	// $("#AA_ProgressSec").hide()
	endProgress()
	////endProgress()
}

function ass_loadComponentInfo(curAKey) {
	abortExistingAJAX("/php/getComponentFullInfo.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	var	compSort	= $("#AA_compSortList").val()
	setSPKCookie("SPK_AA_CurCompInfoSortType", compSort)
	var	curTitle

	cur_AA_AJAX	= $.getJSON(
		"/php/getComponentFullInfo.php", {
			aKey: curAKey,
			sort: compSort
		},
		function(data) {
			curTitle	= data.Title

			if (data.Type == "Asset") {
				$("#AA_PlaySec").hide()
			}
			else {
				$("#AA_PlaySec").show()
				curTitle	+= " [" + data.Start + " - " + data.End +"]"
			}

			var	count	= data.AssignmentKey.length

			var	trArray	= new Array()
			var	keyIdx	= 1;
			trArray[0]	= " class='spk-row'>";
			trArray[1]	= " class='spk-dRow'>";
			var	curTR	= 0
			var	curUsrKey	= getSPKCookie("SPK_UP_CurUserKey");
			var	str	= "<table class='spk-table ui-corner-all' style='width:auto'>"
			str	+= "<tr class='ui-widget-header'>"
			str	+= "<th class='spk-cell'>Component</th>"
			str	+= "<th class='spk-cell'>Task</th>"
			str	+= "<th class='spk-cell'>Update On</th>"
			str	+= "<th class='spk-cell'>Update By</th>"
			str	+= "<th class='spk-cell'>Status</th>"
			str	+= "<th class='spk-cell'>Remarks</th>"
			str	+= "</tr>"
			if (data.STask) {
				for (i = 0; i < data.STask.length; i++) {
					str += "<tr"
					str += trArray[curTR]
					str += "<td class='spk-cell'>" + data.SComponent[i] + "</td>"
					str += "<td class='spk-cell'>" + data.STask[i] + "</td>"
					str += "<td class='spk-cell'>" + getDateUTCStr(data.SUpdateDate[i]) + "</td>"
					str += "<td class='spk-cell'>" + data.SUpUserName[i] + "</td>"
					str += "<td class='spk-cell spk-stat spk-stat-" + data.SStatusKey[i] + "'>" + data.SStatusType[i] + "</td>"
					//if(curUsrKey==905){
					var remarks = data.SRemarks[i];
					var matches = remarks.match(/\[(.*?)\]/);
					var filesList = new Array();
					if(matches){
						var submatch = matches[1];
						filesList = submatch.split(",");
						console.log("files List");
						console.log(filesList);
						var curStd		= getSPKCookie('SPK_STUDIOKEY');
						var targetPath = "";
						if(curStd == 1){
							targetPath = "http://spknet.spkanim.com/proj/UP_Video/Remarks/";
						} else if(curStd == 2){
							targetPath = "http://spknet.mysparky.spkanim.com/proj/UP_Video/Remarks/";
						} else if(curStd == 3){
							targetPath = "http://spknet.spkic.spkanim.com/proj/UP_Video/Remarks/";
						}
						filesList.forEach(function(entry){
							var finalVideoPath = targetPath.trim() + entry.trim();
							console.log(entry);
							var ext = entry.split(".")[1];
							if(ext){
								ext = ext.toLowerCase();
							} else{
								ext ="";
							}
							console.log("extension: "+ext)
							var ext_img_array = ['jpg', 'jpeg', 'png', 'bmp', 'tga', 'psd'];
							var ext_video_array = ['mov', 'mp4'];
							var chk_img = findValueInArray(ext, ext_img_array);
							var chk_vid = findValueInArray(ext, ext_video_array);
							var btnText = "";
							if( chk_img == 1){
								btnText = "show"
							} else if( chk_vid == 1){
								btnText = "play"
							} else{
								btnText = "error"
							}
							remarks = remarks.replace(entry, "<button id='AS_VideoBtn' class='ui-button ui-widget ui-state-default ui-corner-all' style='width:35px;font-size:x-small' onclick='remVideo(\""+finalVideoPath+"\""+ ",\"" + ext +"\")'><strong>" + btnText + "</strong></button>");
						});
					}
					str	+= "<td class='spk-cell remarks-cell' style='text-align:justify'>" + getSPKRemarkList(remarks) + "</td>"
					/*} else{
						str += "<td class='spk-cell remarks-cell' style='text-align:justify'>" + getSPKRemarkList(data.SRemarks[i]) + "</td>"
					}*/
				}
			}
			str	+= "</table>"

			str	+= "<div class='spk-divider'></div>"
			str	+= "<table class='spk-table ui-corner-all'><thead id='AA_THead'>"
			str	+= "<tr class='ui-widget-header'>"
			str	+= "<th class='spk-cell'>Component</th>"
			str	+= "<th class='spk-cell'>Task</th>"
			str	+= "<th class='spk-cell'>Due Date</th>"
			str	+= "<th class='spk-cell'>Update On</th>"
			str	+= "<th class='spk-cell'>Assign To</th>"
			str	+= "<th class='spk-cell'>Update By</th>"
			str	+= "<th class='spk-cell'>Status</th>"
			str	+= "<th class='spk-cell'>Remarks</th>"
			str	+= "</tr></thead><tbody id='AA_TBody' style='overflow:auto'>"

			for (i=0; i<count; i++) {
				if (i>0) {
					if (data.Task[i] != data.Task[i-1]) {
						curTR	= (curTR + 1)%2

						if (compSort == "Type") {
							str += "<tr class='ui-widget-header' style='height:15px;background:rgb(235, 193, 131)'>"
							for (j=0;j<8;j++)
								str	+= "<td></td>"
							str	+= "</tr>"
						}
					}
				}

				str	+= "<tr"
				str	+= trArray[curTR]
				str	+= "<td class='spk-cell'>" + data.Component[i] + "</td>"
				str	+= "<td class='spk-cell'><b>" + data.Task[i] + "</b></td>"
				str	+= "<td class='spk-cell'>" + getDateUTCStr(data.DueDate[i]) + "</td>"
				str	+= "<td class='spk-cell'>" + getDateUTCStr(data.UpdateDate[i]) + "</td>"
				str	+= "<td class='spk-cell'>" + data.ToUserName[i] + "</td>"
				str	+= "<td class='spk-cell'>" + data.UpUserName[i] + "</td>"
				str	+= "<td class='spk-cell spk-stat spk-stat-"+data.StatusKey[i]+"'>" + data.StatusType[i] + "</td>"

				//if(curUsrKey==905){
				var remarks = data.Remarks[i];
				var matches = remarks.match(/\[(.*?)\]/);
				var filesList = new Array();
				if(matches){
					var submatch = matches[1];
					filesList = submatch.split(",");
					console.log("files List");
					console.log(filesList);
					var curStd		= getSPKCookie('SPK_STUDIOKEY');
					var targetPath = "";
					if(curStd == 1){
						targetPath = "http://spknet.spkanim.com/proj/UP_Video/Remarks/";
					} else if(curStd == 2){
						targetPath = "http://spknet.mysparky.spkanim.com/proj/UP_Video/Remarks/";
					} else if(curStd == 3){
						targetPath = "http://spknet.spkic.spkanim.com/proj/UP_Video/Remarks/";
					}
					filesList.forEach(function(entry){
						var finalVideoPath = targetPath.trim() + entry.trim();
						console.log(entry);
						var ext = entry.split(".")[1];
						if(ext){
							ext = ext.toLowerCase();
						} else{
							ext ="";
						}
						console.log("extension: "+ext)
						var ext_img_array = ['jpg', 'jpeg', 'png', 'bmp', 'tga', 'psd'];
						var ext_video_array = ['mov', 'mp4'];
						var chk_img = findValueInArray(ext, ext_img_array);
						var chk_vid = findValueInArray(ext, ext_video_array);
						var btnText = "";
						if( chk_img == 1){
							btnText = "show"
						} else if( chk_vid == 1){
							btnText = "play"
						} else{
							btnText = "error"
						}
						remarks = remarks.replace(entry, "<button id='AS_VideoBtn' class='ui-button ui-widget ui-state-default ui-corner-all' style='width:35px;font-size:x-small' onclick='remVideo(\""+finalVideoPath+"\""+ ",\"" + ext +"\")'><strong>" + btnText + "</strong></button>");
					});
				}
				str	+= "<td class='spk-cell remarks-cell' style='text-align:justify'>" + getSPKRemarkList(remarks) + "</td>"
				/*}else{
					str	+= "<td class='spk-cell remarks-cell' style='text-align:justify'>" + getSPKRemarkList(data.Remarks[i]) + "</td>"
				}*/
				str	+= "</tr>"
			}

			str	+= "</tbody></table>"

			$("#AS_HistorySec").html(str)
			$("#AS_HistorySec").data("key", data.Key)

			var $dialog 	= $("#AS_ComponentInfoDialog")

			$dialog.dialog({
				title: curTitle,
				width : '95%',
				height : 950,
				maxWidth : 0,
				maxHeight : 0,
				close: function( event, ui ) {
					$("#AS_ImagepSec").empty()
					$("#AS_HistorySec").empty()
				}
			})


			$dialog.dialog("open")
			////endProgress()
		}
	)

	$("#AA_compSortList").change(function() {ass_loadComponentInfo(curAKey)})

	////////inProgress()
}

function ass_loadComponentImages(curAKey) {
	abortExistingAJAX("/php/getComponentImages.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.getJSON(
		"/php/getComponentImages.php", {
			aKey: curAKey,
			mode: 1
		},
		function(data) {
			curTitle	= data.Title
			$("#AS_HistorySec").data("key", data.Key)
			var	resizeCode	= "http://"+getSPKCookie("SPK_SPKNET")+"/image.php?width=240&image="

			var	str	=''
			str	+= "<table class='spk-table ui-corner-all'><thead><tr class='ui-widget-header'>"
			for (i=0; i<data.ComponentKey.length; i++) {
				str	+= '<th class="spk-cell">'+data.Component[i]+'</th>'
			}

			str	+= '</tr></thead><tbody><tr>'

			for (i=0; i<data.ComponentKey.length; i++) {
				var	nImages	= data.NetImages[i].split(',')
				var	wImages	= data.WebImages[i].split(',')
				var	dImages = data.DriveImages[i].split(',')

				str	+= '<td class="spk-iCell" style="vertical-align:top">'
				str	+= '<div id="AS_'+data.Component[i]+'Image_Sec">'
				str	+= '<div>'

				var	verList	= data.VersionList[i].split(',')
				if (verList.length>1) {
					str	+= '<div style="float:left;width:100%">'
					str	+= '<strong>Version : </strong>'
					str	+= "<select id='AS_"+data.ComponentKey[i]+"_VersionList' onchange='ass_changeComponentVersionList(\""+data.ComponentKey[i]+"\")'>"
					for (j=0; j<verList.length; j++)
						str	+= '<option value="'+verList[j]+'">'+verList[j]+'</option>'
					str	+= '</select>'
					str	+= '</div>'
				}
				//Rajesh Fithelis Added
				//Start
				str	+=' <script type="text/javascript" src="/public/js/video.2.0.js"></script> '
				str	+=' <script type="text/javascript" src="/public/js/shotPanel.1.1.js"></script> '
				str	+=' <script type="text/javascript" src="/public/js/html5player.1.0.js"></script> '
				str	+=' <script type="text/javascript" src="/public/js/shotViewer.1.1.js"></script> '
				//End
				str	+= '<div id="AS_'+data.Component[i]+'Image">'
				for (j=0; j<nImages.length; j++) {
					if (nImages[j] != '') {
						var	tmp	= nImages[j].split('.')
						if (tmp[tmp.length-1] == 'mov'){
							//str	+= createQuickTimePlayerControlStr(0, 'AS_RigVideo', '760', '540', wImages[j], 'true', 'false', 'true', 'true', 'true', 'false', '#000000', 'ASPECT')// Orignal previous code
							//Rajesh Fithelis for RIG
							//Start
							videoFrameRate = 25;
							videoWidth = 1280;
							videoHeight = 760;
							str += createHTML5PlayerControlsSizeStrRIG('AS_RigVideo', wImages[j], 1, 99, videoWidth, videoHeight)//By Rajesh Fithelis for RIG
							//End
							// console.log(str)
						}else{
							console.log('>>>'+nImages[j])
							console.log('>>>'+encodeURIComponent(nImages[j]))
							str	+= "<img class='spk-thumbnail5' id='AA_IMG_" + data.ComponentKey[i] + "_"+j+"' src='" + resizeCode + SPK_encodeURIComponent(nImages[j]) + "' title='" + dImages[j] + "' onclick='ass_openCompImageViewer(\"" + data.ComponentKey[i] + "\", \"\", \"" + j + "\")'></img>"
						}
					}
				}
				str	+= '</div></div></div></td>'
			}
			str	+= "</tr></tbody></table>"
			$("#AS_ImagepSec").html(str)
			$(".spk-thumbnail5").imageLoader()

			var $dialog 	= $("#AS_ComponentInfoDialog")

			$dialog.dialog({
				title: curTitle,
				width : '95%',
				height : 950,
				maxWidth : 0,
				maxHeight : 0,
				close: function( event, ui ) {
					$("#AS_ImagepSec").empty()
					$("#AS_HistorySec").empty()
				}
			})

			$dialog.dialog("open")
			appendStatus(data)
			////endProgress()
		}
	)
	////////inProgress()
}

function ass_changeComponentVersionList(compKey) {
	var	curVer	= $('#AS_'+compKey+'_VersionList').val()

	abortExistingAJAX("/php/getComponentImages.php");
	// if (cur_AA_AJAX != null)
	// 	cur_AA_AJAX.abort()

	cur_AA_AJAX	= $.getJSON(
		"/php/getComponentImages.php", {
			cKey: compKey,
			ver: curVer,
			mode: 0
		},
		function(data) {
			var	resizeCode	= "http://"+getSPKCookie("SPK_SPKNET")+"/image.php?width=240&image="
			$('#AS_'+data.Component[0]+'Image').empty()
			if (data.numRow>0) {
				var	nImages	= data.NetImages[0].split(',')
				var	wImages	= data.WebImages[0].split(',')
				var	dImages	= data.DriveImages[0].split(',')
				var	str	= '';

				for (j=0; j<nImages.length; j++) {
					if (nImages[j] != '') {
						var	tmp	= nImages[j].split('.')
						if (tmp[tmp.length-1] == 'mov'){
							//str	+= createQuickTimePlayerControlStr(0, 'AS_RigVideo', '760', '540', wImages[j], 'true', 'false', 'true', 'true', 'true', 'false', '#000000', 'ASPECT')
							//Rajesh Fithelis for RIG
							//Start
							videoFrameRate = 25;
							videoWidth = 1280;
							videoHeight = 760;
							str += createHTML5PlayerControlsSizeStrRIG('AS_RigVideo', wImages[j], 1, 99, videoWidth, videoHeight)//By Rajesh Fithelis for RIG
							//End
						}
						else{
							str	+= "<img class='spk-thumbnail5' id='AA_IMG_" + data.ComponentKey[0] + "_"+j+"' src='" + resizeCode + encodeURIComponent(nImages[j]) + "' alt='" + dImages[j] + "' onclick='ass_openCompImageViewer(\"" + data.ComponentKey[0] + "\", " + curVer + ", \"" + j + "\")'></img>"
						}
					}
				}

				$('#AS_'+data.Component[0]+'Image').html(str)
				$('#AS_'+data.Component[0]+'Image').children(".spk-thumbnail5").imageLoader()
			}

			appendStatus(data)
			////endProgress()
		}
	)
	////////inProgress()
}

function ass_openSPKShotManager(curShotCompID) {
	setStatusMessage(('Opening shotComponent ' + curShotCompID + ' in SPK Shot Manager'), 1)
	var	mayaCmd	= 'SPKpl_launchShotCompKey("' + curShotCompID + '")'
	executeMEL(mayaCmd)
}

function ass_pruneIncompleteRows(){
	var rows = $("#AA_TBody").children()
	$.each(rows, function(index, row){
		var rowObj = $(row)
		// console.log(rowId)
		var columns = rowObj.children()

		for(i=2; i < columns.length; i++){
			var columnObj = $(columns[i])
			var columnId = columnObj.attr("id")
			if(columnId){
				if(/C_\w+_TD/.test(columnId)){
					// console.log(columnId)
					var statusDataSize = columnObj.children().length
					// console.log(rowId + " " +columns[i] + " " +  statusDataSize)
					if(statusDataSize == 0){
						rowObj.remove()
					}
				}
			}

		}
	});
}

function ass_uploadExcel() {
	console.log("ass_uploadExcel... assignment.2.3.js");
	var data = new FormData();
	jQuery.each(jQuery('#AA_UN_file')[0].files, function(i, file) {
		data.append('file[]', file);
	});

	var mode = $("#AA_UN_UploadExcelMode").find(":selected").text()
	var	projKey	= getSPKCookie("SPK_CurProject")
	var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	var	shotLevel	= new Array()
	for (i=1; i<maxLvl; i++)
		shotLevel[i-1]	= getSPKCookie("SPK_AA_ShotLevelNum" + i)

	data.append('mode', mode);
	data.append('project', projKey);
	data.append('shotLevel', "["+shotLevel.toString()+"]");
	data.append('nStatus', $("#AA_UN_statusFilList2").val());
	data.append('rtRound', $("#AA_UN_retakeRoundFilList").val());

	App.AJAX.Request("upload.excel", data, "POST",
		function (ret_data) {
			console.log("EXCEL UPLOAD POST PROCESS")
			uploadNotesJSON = ""
			var json_excelOutput = JSON.parse(ret_data.excelOutput);
			console.log(json_excelOutput)
			console.log('retakeDeptDict');
			setSPKCookie("SPK_Excel_Retake_Dept",json_excelOutput["feedback"]["retakeDeptDict"]);
			setSPKCookie("SPK_Excel_RetakeValue",json_excelOutput["feedback"]["retakeValue"]);
			//console.log(json_excelOutput["feedback"]["retakeDeptDict"]);
			console.log(getSPKCookie("SPK_Excel_Retake_Dept"));
			//console.log(json_excelOutput["feedback"]["retakeValue"]);
			console.log(getSPKCookie("SPK_Excel_RetakeValue"));
			console.log('ret_data');
			console.log(ret_data);
			if (ret_data) {
				try{
					console.log('uploadNotesJSON')
					uploadNotesJSON = JSON.parse(ret_data.excelOutput);
					console.log(uploadNotesJSON)
				}catch(e) {
					console.log(e)
					console.log(ret_data)
				}


				if (uploadNotesJSON) {
					if (uploadNotesJSON.feedback.warn){
						console.log("333333333333333333333333333")
						modeWarn = $("#AA_UN_UploadExcelMode_Warn")
						htmlText = "<ul class='error_ul'>";
						validItems = false
						for(key in uploadNotesJSON.feedback.warn){
							errorStr = uploadNotesJSON["feedback"]["str"]["warn"][key];
							htmlText += "<li><p class='error_p'>"+errorStr+"<p class='error_p'>"+uploadNotesJSON.feedback.warn[key].join(", ")+"</li>";
							validItems = true
						}
						htmlText += "</ul>";
						modeWarn.html(htmlText)
						if (validItems) {
							modeWarn.show()
						}
					}
					if (uploadNotesJSON.feedback.error){
						console.log("222222222222222222222222")
						modeError = $("#AA_UN_UploadExcelMode_Error")
						htmlText = "<ul class='error_ul'>";
						for(key in uploadNotesJSON.feedback.error){
							errorStr = uploadNotesJSON["feedback"]["str"]["error"][key];
							htmlText += "<li><p class='error_p'>"+errorStr+"<p class='error_p'>"+uploadNotesJSON.feedback.error[key].join(", ")+"</li>";
						}
						htmlText += "</ul>";
						modeError.html(htmlText)
						modeError.show()
						uploadNotesJSON= ""
					}else{
						console.log("111111111111111111")
						numRows = Object.keys(uploadNotesJSON).length;
						compTypeStr = uploadNotesJSON[0].join(", ");
						htmlText = "<ul class='error_ul'>";
						htmlText += "<li><p class='error_p'>" + numRows + " assignments will be updated!"+
							"<p class='error_p'>Using Component type(s) "+compTypeStr+ "</li>";
						htmlText += "</ul>";
						modeInfo.html(htmlText)

						modeInfo.show()
						delete uploadNotesJSON.feedback;
					}
				}

			}
		}, {cache: false,
			contentType: false,
			processData: false});

}


function getAstSyncStatus(curAssignmentKey, compKey) {
	console.log('getAstSyncStatus')
	var curPrjKey = getSPKCookie("SPK_CurProject")
	var astStat = 0
    $.getJSON(
		"php/getAstSyncStatus.php", {
            pKey: curPrjKey,
			curAssKey: curAssignmentKey,
			curComponentKey: compKey
        },
        function(data) {
			getAstSyncStatus_CB(data)
		}
    )
    //inProgress()
	console.log("myJson:")
	console.log(myJson)
	//return outArr;
}


function getAstSyncStatus_CB(data) {
	//appendStatus(data)
    //endProgress()
	return data.ast
}


function ass_uploadNotes2() {
	var $dialog = $("#AS_UploadNoteDialog2")

	$("#AA_UN_UploadExcelMode_Info").hide()
	$("#AA_UN_UploadExcelMode_Warn").hide()
	$("#AA_UN_UploadExcelMode_Error").hide()
	console.log("ENTER UPLOAD NOTES2");

	$dialog.dialog( {
		width: "25%",
		height: 355,
		buttons: {
			"Update":function(){
				//re-initilize the array
				//AUTOTRIGGER_ROW = new Array()
				//console.log("Hi Rajesh, upload button pressed...");
				if (uploadNotesJSON){
					var	assType	= getSPKCookie("SPK_AA_CurAssignType")
					var	notes	= new Object()
					var	types	= uploadNotesJSON[0]
					var deptComboValue = $("#AS_department").val()
					notes.status = $("#AA_UN_statusFilList2").val()
					notes.rtround = $("#AA_UN_retakeRoundFilList").val()

                    var retakeRoundCookieVal =  $("#AA_UN_retakeRoundFilList").val()
                    setSPKCookie("retakeRoundVal", retakeRoundCookieVal)
					console.log("excelUpload Status");
					console.log(status);
					json_obj = uploadNotesJSON;
					srchStr = ""

					$.each( json_obj, function( index, value ){
						if(index != 0) {
							srchStr += value.Shot + " "
							// srchStr += value + " "
						}
					});
					notes.remarks = json_obj
					console.log("excelUpload remarks");
					console.log(json_obj);
					$("#AA_fromDateFld").val('')
					$("#AA_toDateFld").val('')

					//New for AutoTrigger Value
					setSPKCookie("SPK_AA_ExcelUploadAT", 1)

					setSPKCookie("SPK_AA_AssetFixChkBox", 0)
					setSPKCookie("SPK_AA_BlockingChkBox", 0)
					setSPKCookie("SPK_AA_AnimationChkBox", 0)
					setSPKCookie("SPK_AA_LightingChkBox", 0)
					setSPKCookie("SPK_AA_EffectChkBox", 0)

					if(deptComboValue == "Blocking"){
						setSPKCookie("SPK_AA_AssetFixChkBox", 1)
						setSPKCookie("SPK_AA_BlockingChkBox", 1)
					}

					if(deptComboValue == "Animation"){
						setSPKCookie("SPK_AA_AssetFixChkBox", 1)
						setSPKCookie("SPK_AA_BlockingChkBox", 1)
						setSPKCookie("SPK_AA_AnimationChkBox", 1)
						setSPKCookie("SPK_AA_LightingChkBox", 1)
						setSPKCookie("SPK_AA_EffectChkBox", 1)
					}

					assignManager.sidebar.statusList.select("key", 9)

					assignManager.sidebar.userList.select("key", "ALL")

					assignManager.sidebar.statusList.inverse(1)

					assignManager.sidebar.recordsList.select("ALL")

					if (assType=='Shot') {
						var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel");
						setSPKCookie("SPK_AA_OrderBy", ('Level' + maxLvl))
					}

					setSPKCookie("SPK_AA_Order", 'ASC')

					// assignManager.sidebar.component.clear()
					assignManager.sidebar.component.select(types)

					assignManager.sidebar.search.insert(srchStr)

					$("#AA_MAIN").data("Notes2", notes)

					$dialog.dialog("close")
					console.log("Notes Excel Upload");
					console.log(notes);
					assignManager.refresh()

				}else{
					setSPKCookie("SPK_AA_ExcelUploadAT", 0)
					setSPKCookie("SPK_AA_AssetFixChkBox", 0)
					setSPKCookie("SPK_AA_BlockingChkBox", 0)
					setSPKCookie("SPK_AA_AnimationChkBox", 0)
					setSPKCookie("SPK_AA_LightingChkBox", 0)
					setSPKCookie("SPK_AA_EffectChkBox", 0)
				}
			}
		},
		close: function() {
			$("#AA_UN_UploadExcelMode_Info").hide();
			//setSPKCookie("SPK_AA_ExcelUploadAT", 0);
			$("#AA_UN_file").val("");
			//AUTOTRIGGER_ROW = new Array();
			uploadNotesJSON = "";
			$( '#AA_UN_file_label' ).html( "Choose a file" );
		}
	})
	$dialog.dialog("open")
}

/*function checkShotComponentType(sCompKey){
	var shotCompType = 0;
	var index = 0;
	var sCompStatus = new Array();
	while(index < sCompKey.length){
		sCompStatus[index] = SPK_getShotCompType(sCompKey[index])
		console.log("sCompKey: "+sCompKey[index]);
		index++;
	}
	return shotCompType;
}*/

function SPK_getShotCompType(sComKeyStr){
	var shotCompType = "";
	console.log(sComKeyStr)
	$.getJSON(
		"/php/getShotCompType.php", {
			sCompKey : sComKeyStr
		},
		function(data) {
			/*console.log("output: ");
			console.log("sCompTypeFlag: "+data.sCompTypeFlag);
			console.log("input_sCompKey: "+data.input_sCompKey);
			console.log("sCompType: ");
			console.log(data.sCompType);*/
			var sc_key_flag = data.sCompType;
			if(sc_key_flag == 0){
				//return 0 if single component type avilable
				return 0;
			}else{
				////return 0 if multiple component type avilable
				return 1;
			}
		}
	)
	return shotCompType;
}

//Rajesh Fithelis
//Function to set value of selectbox for given id
function selectElement(id, valueToSelect){
	let element = document.getElementById(id);
	element.value = valueToSelect;
}

//Rajesh Fithelis
//Function to do status change of the selected shots
function ass_sht_status_change() {
	console.log("Status change button pressed");
	console.log("assignment2.3.js: ass_sht_status_change")
	var	sCompKey	= new Array();
	var shotCompTypeFlag = 0;
	var selRows = new Array();
	var rowCnt = 1;
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_");
			sCompKey[sCompKey.length]	= temp[0];
			selRows[selRows.length] = rowCnt;//get the selected shot's number
		}
		rowCnt++;
	})

	var sComKeyStr = sCompKey.toString();
	var selShotsStr = selRows.toString();

	$.getJSON(
		"/php/getShotCompType.php", {
			shot_CompKeyStr : sComKeyStr
		},
		function(data) {
			/*console.log("output: ");
			console.log("sCompTypeFlag: "+data.sCompTypeFlag);
			console.log("input_sCompKey: "+data.input_sCompKey);
			console.log("sCompType: ");
			console.log(data.sCompType);*/
			document.getElementById("AA_statusSelectList").disabled=false;
			var sc_key_flag = data.sCompTypeFlag;
			if(sc_key_flag == 0){
				//if single component type avilable
				//hide the check boxes based on the sCompType value
				var sCompTypeValue = data.sCompType;
				if(sCompTypeValue == "blocking"){
					//hide blocking
					$("#blocking").hide();
				}
				if(sCompTypeValue == "animation"){
					// hide blocking, animation
					$("#blocking").hide();
					$("#animation").hide();
				}
				if(sCompTypeValue == "lighting"){
					// hide blocking, animation
					$("#blocking").hide();
					$("#animation").hide();
					$("#lighting").hide();
				}
				if(sCompTypeValue == "effect"){
					// hide blocking, animation
					$("#blocking").hide();
					$("#animation").hide();
					$("#lighting").hide();
					$("#effect").hide();
				}
				document.getElementById("assError").innerHTML= "";
				document.getElementById("assNotification").innerHTML= "You have selected the following shot's to change STATUS <font color='yellow'>[ " + selShotsStr +" ]</font>";
				//display the selected shot
				//return 0;
			}else{
				/*if multiple component type avilable
				return 1;
				disable the AA_statusSelectList status list box
				*/
				document.getElementById("assNotification").innerHTML= "";
				document.getElementById("AA_statusSelectList").disabled=true;
				document.getElementById("assError").innerHTML= "You have selected <b><font color='red'>multiple department</font></b> to change STATUS <font color='red'>[ " + selShotsStr +" ]</font>";
			}
		}
	)




	/*var shotCompTypeFlag = SPK_getShotCompType(sCompKey.toString());
	if(shotCompTypeFlag ==0){
		console.log("single component type selected: "+shotCompTypeFlag);
		$("#blocking").hide()
		$("#AA_CS_Animation").show()
		$("#AA_CS_Lighting").show()
		$("#AA_CS_Effect").show()
	} else{
		console.log("multiple component type selected: "+shotCompTypeFlag);
	}*/


	//call getShotComponentType: Blocking, Animation, Lighting or Effect

	if (sCompKey.length>0) {
		/*var	projkey		= getSPKCookie("SPK_CurProject")

		if (projkey>91 || projkey==65 || projkey==88)
			$("#AS_LatestPlayblastFilesSec").show()
		else {
			$("#AS_playblastFilesList").val('ALL')
			$("#AS_LatestPlayblastFilesSec").hide()
		}*/

		//var $dialog = $("#AS_SyncLatestPlayblastFilesDialog")
		var $dialog = $("#AS_StatusChangeDialog")
		$dialog.dialog( {
			width: "400",
			height: "600",
			buttons: {
				"Change":function(){
					console.log("change button pressed!");
					selectElement("", changeStatusValue);
					//var	studio	= $("#AS_studioPbFilesList").val();
					//var	layer	= $("#AS_playblastFilesList").val();
					//console.log('Studio: '+studio)
					//console.log('Layer: '+layer)
					//console.log('sCompKey: '+sCompKey)
					/*$.post(
						"/php/syncRenderLatestPlayblastFiles.php", {
							'compKey[]':sCompKey,
							'studio':studio,
							'layer':layer
						},
						function(data) {
							appendStatus(data)
							$dialog.dialog("close")
							//endProgress()
						},
						'json'
					)*/
					//inProgress()
					//appendStatus(data)
					$dialog.dialog("close")
				}
			}
		})
		$dialog.dialog("open")
	}
}


// function ass_uploadNotes() {
// 	var $dialog = $("#AS_UploadNoteDialog")
//
// 	$dialog.dialog( {
// 		width: "60%",
// 		height: 800,
// 		buttons: {
// 			"Update":function(){
// 				var	assType	= getSPKCookie("SPK_AA_CurAssignType")
// 				var	content	= $("#AS_Notes").val()
// 				var rows 	= content.split("\n")
// 				var	notes	= new Object()
// 				var	types	= rows[0].split("\t")
// 				var	srchStr	= ''
//
// 				notes.status	= $("#AA_UN_statusFilList").val()
// 				notes.header	= new Array()
// 				notes.header	= rows[0].split("\t")
//
// 				console.log("TYPES :")
// 				console.log(types)
//
// 				for (i=0; i<types.length; i++) {
// 					notes[types[i]]	= new Array()
// 					if (i>0)
// 						notes[types[i]+"Stat"]	= new Array()
// 				}
//
// 				for (i=0; i<rows.length; i++) {
// 					var	temp	= rows[i].split("\t")
//
// 					for (j=0; j<temp.length; j++) {
// 						temp[j]				= temp[j].replace(/\. /g, ".#");
// 						if (j>0)
// 							temp[j]				= temp[j].replace(/\./g, ".#");
// 						temp[j]				= temp[j].replace(/\.#\.#\.#/g, "...");
// 						//alert(i + " " + j)
// 						notes[types[j]][i]	= temp[j].replace(/\.#\.#/g, "..");
// 					}
//
// 					if (i>0)
// 						srchStr	+= temp[0] + " "
// 				}
//
// 				console.log("SEARC STRING :")
// 				console.log(srchStr)
//
// 				console.log("NOTES:")
// 				console.log(notes)
//
// 				var	CompList	= ''
// 				if (assType=='Asset')
// 					CompList	= 'AA_assetComponentList'
// 				else if (assType=='Shot')
// 					CompList	= 'AA_shotComponentList'
//
// 				$("#AA_fromDateFld").val('')
// 				$("#AA_toDateFld").val('')
//
// 				$("#AA_statusFilList").val(9)
// 				setSPKCookie("SPK_AA_CurStatus", 9)
//
// 				$("#AA_userList").val('ALL')
// 				setSPKCookie("SPK_AA_CurUserKey", 'ALL')
//
// 				$("#AA_StatusListInvChkBox").prop("checked", 1)
// 				setSPKCookie("SPK_AA_CurStatusListInv", 'TRUE')
//
// 				$("#AA_recordsPerPageList").val('ALL')
// 				setSPKCookie("SPK_AA_RecordsPerPage", 'ALL')
//
// 				if (assType=='Shot') {
// 					var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
// 					setSPKCookie("SPK_AA_OrderBy", ('Level' + maxLvl))
// 				}
// 				//if (assType=='Asset')
// 				//setSPKCookie("SPK_AA_OrderBy", 'Component')
// 				//else if (assType=='Shot')
// 				//setSPKCookie("SPK_AA_OrderBy", 'ShotComponent')
// 				setSPKCookie("SPK_AA_Order", 'ASC')
//
// 				$("#"+CompList).children("option").each(function(index) {
// 					for (i=1; i<types.length; i++)
// 						if ($(this).val()==types[i])
// 							$(this).prop("selected",1)
// 				})
//
// 				$("#AA_searchFld").val(srchStr)
//
// 				$("#AA_MAIN").data("Notes", notes)
// 				$("#AS_Notes").val('')
//
// 				$dialog.dialog("close")
//
// 				if (assType=='Asset')
// 					ass_assetComponentChanged()
// 				else if (assType=='Shot')
// 					ass_shotComponentChanged()
// 			},
// 			"Tidy Up":function() {
// 				var	content	= $("#AS_Notes").val()
// 				content		= content.replace(/\"\"/g, "'");
// 				content		= content.replace(/\t\"/g, "aaa##");
// 				content		= content.replace(/\"\t/g, "##aaa");
// 				content		= content.replace(/\"\n/g, "##aaabbb");
// 				$("#AS_Notes").val(content)
//
// 				var	segment		= content.split("##")
// 				var patt1		= /aaa/g;
//
// 				var	newContent	= segment[0]
//
// 				for (i=1; i<segment.length; i++) {
// 					var	res	= segment[i].match(patt1)
//
// 					if (res==null)
// 						segment[i]	= segment[i].replace(/\n/g, "#")
// 					newContent	+= "##" + segment[i]
// 				}
// 				newContent	= newContent.replace(/aaa##/g, "\t");
// 				newContent	= newContent.replace(/##aaabbb/g, "\n");
// 				newContent	= newContent.replace(/##aaa/g, "\t");
// 				newContent	= newContent.replace(/#/g, " ");
// 				content		= newContent.replace(/\n\t/g, "\t");
// 				//$("#AS_Notes").val(content)
//
// 				var rows 	= content.split("\n")
// 				var	str		= ""
//
// 				//str	= content.replace(/\n/g, "")
//
// 				str	+= rows[0]
// 				var	colLength	= rows[0].split("\t").length
// 				var	preLength	= 0
// 				for (i=1; i<rows.length; i++) {
// 					//if (rows[i]=="")
// 					//continue
//
// 					var	col	= rows[i].split("\t")
// 					var	tCol	= col[0].replace(/shot00/i, "");
// 					tCol	= tCol.replace(/shot0/i, "");
// 					tCol	= tCol.replace(/shot/i, "");
// 					tCol	= tCol.replace(/sh00/i, "");
// 					tCol	= tCol.replace(/sh0/i, "");
// 					tCol	= tCol.replace(/sh/i, "");
// 					tCol	= tCol.replace(/sc00/i, "");
// 					tCol	= tCol.replace(/sc0/i, "");
// 					col[0]	= tCol.replace(/sc/i, "");
//
// 					for (j=0; j<col.length; j++) {
// 						//var	tCol	= col[j].replace(/\"\"/g, "'");
// 						var	tCol	= col[j]
//
// 						if (tCol.charAt(tCol.length-1) == "\"")
// 							tCol	= tCol.substr(0,(tCol.length-2))
//
// 						if (tCol.charAt(0) == "\"")
// 							tCol	= tCol.substr(1,(tCol.length-1))
//
// 						if (j==0 && preLength==0)
// 							str	+= "\n" + tCol
// 						else
// 							str	+= "\t" + tCol
// 					}
// 				}
// 				str	= str.replace(/#\. /g, "#");
// 				str	= str.replace(/#\./g, "#");
// 				str	= str.replace(/#\ /g, "#");
// 				$("#AS_Notes").val(str)
// 			}
// 		}
// 	})
// 	$dialog.dialog("open")
// }

function ass_populateNotes2() {
	var	notes	= $("#AA_MAIN").data("Notes2")
	var	projKey	= getSPKCookie("SPK_CurProject")
	console.log("projectKey: "+projKey);

	if (notes != null) {
        console.log("NOTES : ass_populateNotes2 :")
        console.log(notes)
		count = 1

		$.each(assignManager.assignment.all(), function( index, value ){
			console.log("value")
			console.log(value)
			currAssign = assignManager.assignment.get(index+1)
			taskName = value.Component
			if(taskName == undefined){
				taskName = value.Task
			}
			taskName = taskName.replace(/OLD/g, "").trim()
			console.log("task name:");
			console.log(taskName);
			if(projKey==117 || projKey==114 || projKey==20 || projKey==121 || projKey==126){
				//Tobot-V, DTM
				ShotNum = value.Scene
			} else{
				//project with Shot
				ShotNum = value.Shot
			}
			//ShotNum = value.Scene
			try {
				validEntry = notes.remarks[ShotNum][taskName]
				//console.log("validEntry lookup");
				//console.log(validEntry);
				//console.log("valid entry");
				//console.log(validEntry);
				if (validEntry[0] != null) {
					currAssign.updateStatus(validEntry[1])
					currAssign.updateRemarks(validEntry[0])
				}
			}catch(err){

			}
		});
		$("#AA_MAIN").removeData("Notes2")
		NEED_SAVE	= true
	}

}

// function ass_populateNotes() {
// 	var	notes	= $("#AA_MAIN").data("Notes")
//
// 	if (notes != null) {
// 		console.log("NOTES : ass_populateNotes :")
// 		console.log(notes)
//
// 		var	errorMain	= new Array()
// 		var	errorComp	= new Array()
// 		nCount	= 1;
// 		var	hLength	= notes.header.length
// 		var	nLength	= notes[notes.header[0]].length
// 		var	rows	= $("#AA_TBody").children()
// 		var	rLength	= rows.length
// 		var	rCount	= 0
// 		var	aFound	= false
//
// 		for (j=hLength-1; j>0; j--) {
// 			var	curComp	= notes.header[j]
// 			var	temp	= curComp.split("_")
// 			if (temp.length<2)
// 				continue
//
// 			for (i=1; i<nLength; i++) {
// 				var	curPre	= notes[curComp][i]
//
// 				if (curPre == '' || curPre == null)
// 					continue
//
// 				var curPres	= curPre.split(" ")
//
// 				var	tempRem	= ''
// 				for (k=curPres.length-1; k>=0; k--) {
// 					var	curPreRem	= notes[curPres[k]][i].split("#")
//
// 					for (l=0; l<curPreRem.length; l++) {
// 						if (curPreRem[l] != '' && curPreRem[l] != null) {
// 							curPreRem[l]	= curPreRem[l].replace(/^ /, "")
// 							tempRem	+= "#<b>" + curPres[k] + " Notes : </b>" + curPreRem[l]
// 						}
// 					}
// 				}
//
// 				notes[temp[1]][i]			= tempRem + "#" + notes[temp[1]][i]
// 				notes[temp[1]+"Stat"][i]	= 19
// 				notes[curComp][i]			= "-#-"
// 			}
// 		}
//
// 		for (i=1; i<nLength; i++) {
// 			aFound	= false;
// 			var	ass	= notes[notes.header[0]][i]
// 			if (ass == "")
// 				continue
//
// 			while (rCount<rLength) {
// 				var	col		= $(rows[rCount++]).children()
// 				var	cLength	= col.length
//
//
// 				if (ass != $(col[1]).text()) {
// 					if (!aFound)
// 						errorMain[errorMain.length]	= notes.header[0] + " " + ass
// 					rCount--
// 					break
// 				}
//
// 				aFound		= true
// 				for (j=1; j<hLength; j++) {
// 					var	remarks	= notes[notes.header[j]][i]
//
// 					if (remarks	== "")
// 						continue
//
// 					//remarks	= remarks.replace(/\./g, ".#");
//
// 					var	curComp	= notes.header[j]
// 					if ($(col[cLength-9]).text() == curComp || hLength<3) {
// 						var	cID	= $(col[1]).attr("id")
// 						var	temp	= cID.split("_")
//
// 						ass_duplicateRow(temp[1]+"_"+temp[2])
//
// 						$(col[cLength-1]).data("rem", remarks)
// 						$(col[cLength-1]).text(remarks)
//
// 						ass_formatRemarks(temp[1]+"_"+temp[2])
// 						if (notes[notes.header[j]+"Stat"][i] == '' || notes[notes.header[j]+"Stat"][i] == null)
// 							ass_setStatusByKey(temp[1]+"_"+temp[2], notes.status)
// 						else
// 							ass_setStatusByKey(temp[1]+"_"+temp[2], notes[notes.header[j]+"Stat"][i])
//
// 						notes[notes.header[j]][i]	= "-#-"
//
// 						break
// 					}
// 				}
// 			}
//
// 			if (aFound)
// 				for (j=1; j<hLength; j++)
// 					if (notes[notes.header[j]][i] != "-#-" && notes[notes.header[j]][i] != "")
// 						errorComp[errorComp.length]	= notes.header[0] + " " + ass + " : " + notes.header[j]
// 		}
//
// 		var	str	= ""
// 		if (errorMain.length>0) {
// 			str	+= "<div><b>The following items can not be found</b></div>"
// 			for (i=0; i<errorMain.length; i++)
// 				str	+= "<div>" + errorMain[i] + "</div>"
// 			str	+= "<div class='spk-divider'></div>"
// 		}
//
// 		if (errorComp.length>0) {
// 			str	+= "<b>The following components can not be found</b>"
// 			for (i=0; i<errorComp.length; i++)
// 				str	+= "<div>" + errorComp[i] + "</div>"
// 		}
//
// 		if (str != "") {
// 			$("#AA_ErrorSec").html(str)
//
// 			var $dialog = $("#AS_ErrorDialog")
// 			$dialog.dialog( {
// 				width: "60%",
// 				height: 600
// 			})
// 			$dialog.dialog("open")
// 		}
//
// 		$("#AA_MAIN").removeData("Notes")
//
// 		NEED_SAVE	= true
// 	}
// }

function ass_getTaskAutoCompleteList(field, i, j, aKey) {
	var cache = {};
	$("#"+field).autocomplete({
		minLength: 1,
		source: function(request, response) {
			if (request.term in cache) {
				response(cache[request.term]);
				return;
			}

			var	textStr	= $("#"+field).val()

			var	assType	= getSPKCookie("SPK_AA_CurAssignType")
			var	projKey	= getSPKCookie("SPK_CurProject")
			var	curComp
			var	compStr

			if (assType=="Asset")
				compStr	= getSPKCookie("SPK_AA_CurAssetComponent") + ''
			else
				compStr	= getSPKCookie("SPK_AA_CurShotComp") + ''

			curComp		= compStr.split(",")
			if (searchArray(curComp, "ALL")>=0)
				curComp	= ["ALL"]

			$.getJSON(
				"/php/getTaskAutoCompleteList.php", {
					aType:assType,
					pKey:projKey,
					'comp[]':curComp,
					tStr:textStr
				},
				function(data) {
					var	$curCol	= $("#C0"+i+"_"+j+"_"+aKey)
					if (data.TaskName.length==0)
						data.TaskName[0]	= ($("#"+field).val())
					else {
						$("#AA_tempInput").unbind("blur")
						cache[request.term] = data.TaskName;
					}

					response(data.TaskName)
				}
			)
		},
		select: function(event,ui) {
			if (field=="AA_tempInput") {
				$("#"+field).val(ui.item.label) // for whatever reason, need to set 2 times
				$("#"+field).val(ui.item.label)
				ass_removeColumnInput(i,j,aKey)
			}
		},
		close: function(event,ui) {
			if (field=="AA_tempInput")
				ass_removeColumnInput(i,j,aKey)
		}
	});
}

function sanitize_for_regex(eStrval){
	var str_pattern = RegExp("[" + "{}[]-/\\()*+?.%$|".replace(RegExp(".", "g"), "\\$&") + "]", "g");
	return eStrval.replace(str_pattern, "\\$&");
}

function ass_addColumnInput(i,j,aKey) {
	//console.log("ass_addColumnInput-i: "+i);
	//console.log("ass_addColumnInput-j: "+j);
	//console.log("ass_addColumnInput-aKey: "+aKey);

	NOREFRESH	= 1

	$("#AA_tempInput").remove()
	//var	aKey	= $("#C0_"+j).data("key")

	var curCol	= $("#C"+i+"_"+j+"_"+aKey)
	var	curText	= curCol.text()
	//var	curText	= sanitize_for_regex(curCol.text())
	//console.log("ass_addColumnInput-curCol:");
	//console.log(curCol);
	//console.log("ass_addColumnInput-curText: "+curText);
	//curCol.text("")
	var	cW		= $(curCol).width()
	var	cH		= $(curCol).height()
	//alert(cW + " " + cH)

	var	uGrpKey	= getSPKCookie('SPK_CurUserGroupKey')
	if (uGrpKey<3) {
		var	uKey	= getSPKCookie('SPK_CurUserKey')
		var	curColUKey	= $("#C2_"+j+"_"+aKey).data("key")
		if (uKey != curColUKey)
			return
	}

	if (aKey != "") {
		// do not allow editing of Assignment Name(Task) and Assign To for existing assignment
		if (i==0 || i==2) {
			if ($("#C5_"+j+"_"+aKey).data("key") != 1)
				return
		}
		else if (i==1) {
			// do not allow editing of Due Date if not new Status is inserted
			if ($("#CT1_"+j+"_"+aKey).length ==0)
				return
			else {
				// do not allow editing of Due Date if current Status is not SPK Retake or DIR Retake
				var	curKey	= $("#C5_"+j+"_"+aKey).data("key")
				// This is using StatusKey
				// <SPK Approve, Lead Note, Extend Due Date, Msc Retake, Serious Mistake
				if (!(curKey<4 || curKey==8 || curKey==10 || curKey==13 || curKey==16))
					return
			}
		}

		// Create duplicated row. Original row is meant for new Status insertion
		if ($("#CT1_"+j+"_"+aKey).length==0)
			ass_duplicateRow(j+"_"+aKey)
	}
	else {
		// set to New Task if no task is previously assigned
		if ($("#C5_"+j+"_"+aKey).data("key")=="")
			ass_setStatus((j+"_"+aKey),1)

		// set to dirty row if current field is the status field
		if (i==5) {
			ass_addDirtyRow(j+"_"+aKey)
			return
		}
	}
	if (i==0) {
		//curCol.html("<input id='AA_tempInput' onblur='ass_removeColumnInput(" + i + "," + j + ",\"" + aKey +"\")' class='spk-column-input' style='font-size:1em;' value='"+curText+"'></input>");
		curCol.html("<input id='AA_tempInput' class='spk-column-input' style='font-size:1em;' value='"+curText+"'></input>");
		$("#AA_tempInput").blur(function() {ass_removeColumnInput(i, j, aKey)})
		//$("#AA_tempInput").resizable();
		ass_getTaskAutoCompleteList("AA_tempInput",i,j,aKey)
	}
	else if (i==1) {
		curCol.html("<input id='AA_tempInput' class='spk-column-input' style='font-size:1em;'></input>");
		var	today	= new Date()

		if (curText == "")
			curText	= today.getFullYear() + "-" + padding((today.getMonth()+1),2) + "-" + padding(today.getDate(),2) + ' 23:59:59 ' + GetCookie('SPK_TIMEZONESTR')

		var	tzObj	= JSON.parse(GetCookie('SPK_TIMEZONELIST'))
		$('#AA_tempInput').datetimepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: 'yy-mm-dd',
			timeFormat: 'HH:mm:ss z',
			showOtherMonths: true,
			selectOtherMonths: true,
			numberOfMonths: 2,
			timezoneList: tzObj,
			onClose: function(dDateStr,inst) {
				var	dueDate	= $(this).datetimepicker("getDate")
				if (dueDate==null || '')
					$("#C1_"+j+"_"+aKey).text('')
				else {
					var	dateStr	= getDateTimeString(dueDate) + ' ' + GetCookie('SPK_TIMEZONESTR')
					$("#C1_"+j+"_"+aKey).text(dateStr)
				}
				ass_addDirtyRow(j+"_"+aKey)
			}
		})
		$("#AA_tempInput").change(function() {ass_dueDateChange("AA_tempInput")})
		$('#AA_tempInput').val(curText)
	}
	//pgr
	else if (i==7) {
		colStr	= "<select id='AA_tempInput' onblur='ass_removeColumnInput(" + i + "," + j + ",\""+aKey+"\")' class='spk-column-input' style='font-size:1em;"
		colStr	+= "'>"
		for(var si=0; si<=20; si++){
		colStr	+= "<option>"+si+"</option>";
		}
		colStr	+= "</select>"
		curCol.html(colStr);
	}
	else if (i==8) {
		colStr	= "<select id='AA_tempInput' onblur='ass_removeColumnInput(" + i + "," + j + ",\""+aKey+"\")' class='spk-column-input' style='font-size:1em;"
		colStr	+= "'>"
		for(var si=0; si<=20; si++){
		colStr	+= "<option>"+si+"</option>";
		}
		colStr	+= "</select>"
		curCol.html(colStr);
	}
	else if (i<6) {
		curVal	= curCol.data("key")

		var	uList
		if (i==2)
			uList	= document.getElementById("AA_assignToList")
		else if (i==5)
			uList	= document.getElementById("AA_statusList")

		colStr	= "<select id='AA_tempInput' onblur='ass_removeColumnInput(" + i + "," + j + ",\""+aKey+"\")' class='spk-column-input' style='font-size:1em;"
		if (i==5)
			colStr	+= "font-weight:bold;text-align:center;"
		colStr	+= "'></select>"
		curCol.html(colStr);

		var	aList	= document.getElementById("AA_tempInput")

		var	check	= 1
		if (curText == "")
			check	= 0

		for (k=0; k<uList.length; k++) {
			var opt		= document.createElement('option');
			opt.text	= uList.options[k].text
			opt.value	= uList.options[k].value
			aList.add(opt,null)

			if (opt.value==curVal)
				check	= 0
		}

		if (i==2 && check) {
			var opt		= document.createElement('option');
			opt.text	= curText
			opt.value	= curVal
			aList.add(opt,null)
		}
		else if (i==5) {
			for (k=1; k<uList.length; k++) {
				//var	tColor	= uList.options[k].style.color
				//var	bgColor	= uList.options[k].style.background
				var	display	= uList.options[k].style.display
				var	val		= uList.options[k].value
				//$("#AA_tempInput option:eq(" + k + ")").css({"color":tColor,"background":bgColor,"display":display})
				$("#AA_tempInput option:eq(" + k + ")").addClass('spk-stat spk-stat-'+val)
				$("#AA_tempInput option:eq(" + k + ")").css({"display":display})

				$("#AA_tempInput").change(function(){
					var	idx		= $("#AA_tempInput").prop("selectedIndex")
					console.log("aKey:" + aKey)
					var	assType	= getSPKCookie("SPK_AA_CurAssignType")
					// On Submission status, idx is using option list order, not StatusKey
					if (assType=="Asset" && idx==5) {
						console.log("into idx==5");
						if (!ass_checkIsRigFacialTask(i,j,aKey)) {
							console.log("its not a rig");
							UPLOAD_DIALOG_OPEN	= 1
							ass_submitAssetImage(i, j, aKey)
						}
						//For Rig Rajesh F added: 09-Oct-2019
						if (ass_checkIsRigTask(i,j,aKey)) {
							console.log("its a rig");
							UPLOAD_DIALOG_OPEN	= 1
							ass_submitAssetImage(i, j, aKey)
						}
						//End
					}
					if (assType=="Shot" && idx==14) {
						console.log("4332: DIR submission");
					}
					//var	tmpInputVal	= idx
					//console.log("AA_tempInput:")
					//console.log(tmpInputVal)
				})

				if (!ass_checkIsRigFacialTask(i,j,aKey)) {
					$( "#AA_TAB" ).mouseup(function() {
						setTimeout(
							function() {
								$( "#AA_tempInput" ).change()
							}, 2500);
					});
				}
			}
		}
		//Testing
		var	assTypex	= getSPKCookie("SPK_AA_CurAssignType")
		console.log("assTypex: ");
		console.log(assTypex);
		//Rajesh Fithelis: Testing Rig Upload
		console.log("Rajesh Fithelis >> RigUpload Testing...");
		$("#AA_tempInput").val(curVal)
	}
	else {
		var	curUsrKey	= getSPKCookie("SPK_UP_CurUserKey");
		var	oRem	= curCol.data("rem")
		cH	*= 2
        if (cH < 200){
            cH = 200
        }
		//enabled for all users to upload comments on 08_june_2020 12.51 PM
		//if(uGrpKey>2 || curUsrKey==905){
			var html_str  = "<textarea id='AA_tempInput' onblur='ass_removeColumnInput(" + i + "," + j + ",\""+aKey+"\")' class='spk-column-input' style='font-size:1em;height:"+cH+"'>"+oRem+"</textarea>";
			html_str 	 += "<button type='button' class='assBtn' style='width:120px;height:30px;font-size:x-big' id='remarksVideoUpBtn' onclick='ass_uploadRemarksVideo(" + i + "," + j + ",\""+aKey+"\")' >Upload Media</button>"
			curCol.html(html_str);
		//} else{
			//curCol.html("<textarea  id='AA_tempInput' onblur='ass_removeColumnInput(" + i + "," + j + ",\""+aKey+"\")' class='spk-column-input' style='font-size:1em;height:"+cH+"'>"+oRem+"</textarea>");
		//}
		$("#AA_tempInput").height(cH)
		$("#AA_tempInput").resizable();
		//$(curCol).height(cH)
	}

	//$("#AA_tempInput").height(cH)
	$("#AA_tempInput").width(cW)
	curCol.width(cW)
	//if(uGrpKey>2 || curUsrKey==905){
		$("#remarksVideoUpBtn").focus()
	//} else{
		//$("#AA_tempInput").focus()
	//}
	NEED_SAVE	= true
}

function ass_focusToRemarkInput(filesUploaded = ""){
	console.log("ass_focusToRemarkInput")
	$("#AA_tempInput").focus()
	var quote = "Remark files attached "+filesUploaded;
	//console.log(filesUploaded)
	if(filesUploaded){
		$("#AA_tempInput").val(quote)
	}

}


function ass_uploadRemarksVideo(i, j, aKey) {
	var	uKey		= getSPKCookie("SPK_CurUserKey")

	var	myUpload	= $(".spk-fileUpload").fineUploader({
		request: {
			endpoint: '/php/uploadRemarksVideo.php',
			params : {
				compKey : j,
				assKey : aKey,
				userKey : uKey
			}
		},
		multiple: true,
		validation: {
			allowedExtensions: ['jpeg', 'jpg', 'png', 'bmp', 'gif', 'mov', 'mp4'],
			acceptFiles: 'jpeg, jpg, png, bmp, gif, mov, mp4'
		},
		text: {
			uploadButton: 'Browse or drop your images/videos here\n(jpeg, jpg, png, bmp, gif, mov, mp4)'
		},
		autoUpload: true,
		failedUploadTextDisplay: {
			mode: 'custom',
			maxChars: 40,
			responseProperty: 'error',
			enableTooltip: true
		},
		debug: true
	}).on('complete', function(event, id, fileName, responseJSON) {
		console.log("upload response 987968")
		console.log(responseJSON)
		if (responseJSON.success) {
			fileName = responseJSON.fname
			iName	= fileName.replace(/\./g, '_')
			iName	= iName.replace(/\(/g, '_')
			iName	= iName.replace(/\)/g, '_')
			iName	= iName.replace(/\&/g, '_')
			var	tmp	= fileName.split(".")
			var	fileType	= tmp[tmp.length-1]

			if($("#"+iName).prop('id') == null) {
				if (fileType == 'mov' || fileType == 'mp4') {
					console.log("imgPath: "+imgPath)
					console.log("fileName: "+encodeURIComponent(fileName))
					var	str	= createQuickTimePlayerControlStr(0, iName, '240', '', (responseJSON.imgPath + encodeURIComponent(fileName)), 'true', 'false', 'true', 'false', 'false', 'false', '#000000', 'ASPECT')
					// TODO Add HTML5 Player here
					$(this).append(str)
				}
				else{
					console.log("fileName: "+fileName)
					console.log("fileName: "+encodeURIComponent(fileName))
					$(this).append('<img id="' + iName + '" class="spk-thumbnail4" src="'+ responseJSON.imgPath + '/' + encodeURIComponent(fileName) + '" style="width:240px" alt="' + fileName + '"></img>');
				}
			}
			else {
				$("#"+iName).attr('src', (responseJSON.imgPath + encodeURIComponent(fileName)))
				$("#"+iName).attr('alt', (responseJSON.imgPath + fileName))
			}
		}
	}).on('submit', function(event, id, fileName) {
		$(".spk-fileUpload").fineUploader('setParams', {
			compKey : j,
			assKey : aKey,
			userKey : uKey
		})
	})
	var filesUploaded = "";
	var $dialog 	= $("#AS_FileUploadDialog")
	$dialog.dialog({
		width : '90%',
		height : 800,
		buttons: {
			"Cancel":function(){
				ass_addColumnInput(i, j, aKey)
				ass_focusToRemarkInput(filesUploaded)
				$dialog.dialog("close")

				//ass_getContent()
			},
			"Reset":function(){
				$("#FileUploadSec").fineUploader('reset')
				$.getJSON(
					"/php/deleteRemarksVideo.php", {
						compKey : j,
						assKey : aKey,
						userKey : uKey
					},
					function(data) {
						ass_addColumnInput(i, j, aKey)
						ass_focusToRemarkInput(filesUploaded)
					}
				)
			},
			"Submit":function(){
				var	rem	= $("#AS_FileUploadRemarkFld").val()
				var	keepFileName	= 1
				if (!$("#AA_FU_KeepFileName").prop("checked"))
					keepFileName	= 0

				$.getJSON(
					"/php/submitRemarksVideo.php", {
						ival : i,
						compKey : j,
						assKey : aKey,
						userKey : uKey,
						remark : rem,
						kTN : keepFileName
					},
					function(data) {
						console.log("uploaded_files");
						console.log(data.uploaded_files_str);
						NEED_SAVE	= false
						filesUploaded = data.uploaded_files_str;
						dia_box_remarks = data.uploaded_remarks;
						filesUploaded = filesUploaded;
						ass_addColumnInput(i, j, aKey)
						ass_focusToRemarkInput(filesUploaded)
						$dialog.dialog("close")
						appendStatus(data)
						var tmpUploadedFiles = data.uploaded_files
						syncUploadFiles(tmpUploadedFiles)
						console.log("sync initated")
						//ass_getContent()
					}
				)
				////////inProgress()
			}
		},
		close: function( event, ui ) {
			UPLOAD_DIALOG_OPEN	= 0
			$("#FileUploadSec").fineUploader('reset')
			ass_addColumnInput(i, j, aKey)
			ass_focusToRemarkInput(filesUploaded)
			$.getJSON(
				"/php/deleteRemarksVideo.php", {
					compKey : j,
					assKey : aKey,
					userKey : uKey
				},
				function(data) {
					ass_addColumnInput(i, j, aKey)
					ass_focusToRemarkInput(filesUploaded)
				}
			)
			//ass_removeRow(j+"_"+aKey)
		}
	})

	$dialog.dialog("open")
}

function syncUploadFiles(uploaded_files){
	var uKey = getSPKCookie("SPK_UP_CurUserKey");
	$.post(
		"/php/syncRemarksRR.php", {
			curUser:uKey,
			'uploadedFiles[]':uploaded_files
		},
		function(data) {
			//console.log(data)
			//console.log("Files sync initated to following studio")
			//console.log(data.syncStudio)
		},
		'json'
	)
console.log("syncUploadFiles fnx call end")
}

/*function ass_uploadRemarksVideo(i, j, aKey){
	console.log("assignment.2.3.js >> ass_uploadRemarksVideo")
	UPLOAD_DIALOG_OPEN	= 1
	var	uKey		= getSPKCookie("SPK_UP_CurUserKey")
	var curPrjKey = getSPKCookie("SPK_CurProject")
    var astKey    = aKey
	var cKey = j
	console.log("11")
	var	myUpload	= $(".spk-fileUpload").fineUploader({
		request: {
			endpoint: '/php/uploadRemarksVideo.php',
			params : {
				compKey : j,
				assKey : aKey,
				userKey : uKey
			}
		},
		multiple: true,
		validation: {
			allowedExtensions: ['jpeg', 'jpg', 'png', 'bmp', 'tga', 'psd', 'tif'],
			acceptFiles: 'jpeg, jpg, png, bmp, tga, psd, tif'
		},
		text: {
			uploadButton: 'Browse or drop your images/videos here\n(jpeg, jpg, png, bmp, tga, psd, tif)'
		},
		autoUpload: true,
		failedUploadTextDisplay: {
			mode: 'custom',
			maxChars: 40,
			responseProperty: 'error',
			enableTooltip: true
		},
		debug: true
	}).on('complete', function(event, id, fileName, responseJSON) {
		if (responseJSON.success) {
			iName	= fileName.replace(/\./g, '_')
			iName	= iName.replace(/\(/g, '_')
			iName	= iName.replace(/\)/g, '_')
			iName	= iName.replace(/\&/g, '_')
			var	tmp	= fileName.split(".")
			var	fileType	= tmp[tmp.length-1]

			if($("#"+iName).prop('id') == null) {
				if (fileType == 'mov') {
					var	str	= createQuickTimePlayerControlStr(0, iName, '240', '', (responseJSON.imgPath + encodeURIComponent(fileName)), 'true', 'false', 'true', 'false', 'false', 'false', '#000000', 'ASPECT')
					// TODO Add HTML5 Player here
					$(this).append(str)
				}
				else
					$(this).append('<img id="' + iName + '" class="spk-thumbnail4" src="'+ responseJSON.imgPath + encodeURIComponent(fileName) + '" style="width:240px" alt="' + fileName + '"></img>');

			}
			else {
				$("#"+iName).attr('src', (responseJSON.imgPath + encodeURIComponent(fileName)))
				$("#"+iName).attr('alt', (responseJSON.imgPath + fileName))
			}
		}
	}).on('submit', function(event, id, fileName) {
		$(".spk-fileUpload").fineUploader('setParams', {
			compKey : j,
			assKey : aKey,
			userKey : uKey
		})
	})

	console.log("22")
	var $dialog 	= $("#AS_RemarksVideoUploadDialog")
	$dialog.dialog({
		width : '90%',
		height : 800,
		buttons: {
			"Cancel":function(){
				$dialog.dialog("close")
				//ass_getContent()
			},
			"Reset":function(){
				$("#FileUploadSec").fineUploader('reset')
				$.getJSON(
					"/php/deleteRemarksVideo.php", {
						compKey : j,
						assKey : aKey,
						userKey : uKey
					},
					function(data) {
						appendStatus(data)
					}
				)
			},
			"Submit":function(){
				var	rem	= $("#AS_VideoFileUploadRemarkFld").val()
				var	keepFileName	= 1
				if (!$("#AA_VideoFU_KeepFileName").prop("checked"))
					keepFileName	= 0

				$.getJSON(
					"/php/submitRemarksVideo.php", {
						prjKey : curPrjKey,
						compKey : j,
						assKey : aKey,
						userKey : uKey,
						remark : rem,
						kTN : keepFileName
					},
					function(data) {
						NEED_SAVE	= false
						console.log('uploaded files:')
						console.log(data)
						if (data.uploaded_files >0){
							alert ("Upload success");
						} else{
							alert("Upload failed");
						}
						$dialog.dialog("close")
						appendStatus(data)
					}
				)
			}
		},
		close: function( event, ui ) {
			UPLOAD_DIALOG_OPEN	= 0
			$("#FileUploadSec").fineUploader('reset')
			$.getJSON(
				"/php/deleteRemarksVideo.php", {
					compKey : j,
					assKey : aKey,
					userKey : uKey
				},
				function(data) {
					appendStatus(data)
				}
			)
		}
	})
	console.log("33")
	$dialog.dialog("open")
}*/

function ass_removeColumnInput(i,j,aKey) {
	var	curUsrKey	= getSPKCookie("SPK_UP_CurUserKey");
	var	curVal	= $("#AA_tempInput").val()
	//move the uploaded file in a temp location
	//file_name: i + "_" + j + "_" + aKey
	var file_name = "";
	if(curUsrKey==905){
		file_name = i + "_" + j + "_" + aKey;
	}
	if (curVal == "-")
		curVal	= ""

	var	$curCol	= $("#C"+i+"_"+j+"_"+aKey)
	if (i==2 || i==5) {
		//var	idx		= $("#AA_tempInput").attr("selectedIndex")
		var	idx		= $("#AA_tempInput").prop("selectedIndex")
		//alert( 'idx = ' + idx )
		var	curText	= $("#AA_tempInput option:eq(" + idx + ")").prop("text")
		//var	curText	= $("#AA_tempInput option:eq(" + idx + ")").prop("text")

		if (curText == "-")
			curText	= ""

		if (i==5) {
			if (idx>0) {
				if (idx==6) {
					var	assType	= getSPKCookie("SPK_AA_CurAssignType")

					if (assType=="Asset") {
						if (!ass_checkIsRigFacialTask(i,j,aKey))
							if (UPLOAD_DIALOG_OPEN == 0) {
								ass_submitAssetImage(i, j, aKey)
							}
					}
				}

				if (ass_verifyStatus((j+"_"+aKey),idx)) {
					ass_setStatus((j+"_"+aKey),idx)
				}
				else
					return
			}
			else {
				// remove the entire row if status is set to "-"
				ass_removeRow(j+"_"+aKey)
			}
		}
		else
			$curCol.text(curText)

		$curCol.data("key", curVal)
	}
	else if (i==6) {
		$curCol.data("rem", curVal)
		ass_formatRemarks(j+"_"+aKey)
	}
	else {
		//$("#AA_tempInput").autocomplete("destroy")
		$curCol.text(curVal)
	}

	ass_addDirtyRow(j+"_"+aKey)

	NEED_SAVE	= true
}


function ass_checkIsRigTask(i,j,aKey) {
	console.log("i: "+i);
	console.log("j: "+j);
	console.log("aKey: "+aKey);
	var	aCompStr	= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp		= aCompStr.split(",")
	var	found		= 0
	var compList	= new Array('Rig');
	console.log("aComp[0]: "+aComp[0]);
	if (aComp.length==1) {
		if (aComp[0]=='Rig')
			return	1
		else if  (aComp[0]=='ALL')
			found	= 1;
	}
	else {
		for (aIdx in aComp) {
			if (aComp[aIdx]=='Rig') {
				found	= 1;
				break;
			}
		}
	}

	if (found) {
		found	= 0
		for (idx in compList) {
			var	text	= $("#R_" + j + "_" + aKey + " > td:contains('" + compList[idx] + "')").text()

			if (text.match(/LightRig/g)) {
				found	= 0
				break
			}
			else if (text.match(/Rig/g)) {
				found	= 1
				break
			}
		}
	}
	console.log("found: "+found);
	return	found
}

function ass_checkIsRigFacialTask(i,j,aKey) {
	//console.log("i: "+i);
	//console.log("j: "+j);
	//console.log("aKey: "+aKey);
	var	aCompStr	= getSPKCookie("SPK_AA_CurAssetComponent") + ''
	var	aComp		= aCompStr.split(",")
	var	found		= 0
	var compList	= new Array('Rig', 'Facial');
	//var compList	= new Array('Facial');
	console.log("aComp[0]: "+aComp[0]);
	if (aComp.length==1) {
		if (aComp[0]=='Rig' || aComp[0]=='Facial')
		//if (aComp[0]=='Facial')
			return	1
		else if  (aComp[0]=='ALL')
			found	= 1;
	}
	else {
		for (aIdx in aComp) {
			if (aComp[aIdx]=='Rig' || aComp[aIdx]=='Facial') {
				//if (aComp[aIdx]=='Facial') {
				found	= 1;
				break;
			}
		}
	}

	if (found) {
		found	= 0
		for (idx in compList) {
			var	text	= $("#R_" + j + "_" + aKey + " > td:contains('" + compList[idx] + "')").text()

			if (text.match(/LightRig/g)) {
				found	= 0
				break
			}
			else if (text.match(/Facial/g) || text.match(/Rig/g)) {
				//if (text.match(/Facial/g)) {
				found	= 1
				break
			}
		}
	}
	//console.log("found: "+found);
	return	found
}

function ass_multiColumnEdit(i) {
	NOREFRESH	= 1
	var	curText	= ""
	var	curVal	= ""
	var	idx

	if (i==0)
		curText	= $("#AA_taskFld").val()
	else if (i==1)
		curText	= $("#AA_dueDateFld").val()
	else if (i==2 || i==5) {
		var	tar	= "AA_assignToList"
		if (i==5)
			tar	= "AA_statusList"

		curVal	= $("#" + tar).val()
		//idx		= $("#" + tar).attr("selectedIndex")
		idx		= $("#" + tar).prop("selectedIndex")
		curText	= $("#" + tar + " option:eq(" + idx + ")").text()
		//alert(curText)
	}
	else if (i==6)
		curText	= $("#AA_remarkFld").val()

	if (curText == "-") {
		curText	= ""
		curVal	= ""
	}

	var	compKey	= new Array()
	$(".spk-check").each(function(index){
		if ($(this).prop("checked"))
		//if ($(this).attr("checked"))
			compKey[compKey.length]	= $(this).val()
	})

	for (j=0; j<compKey.length; j++) {
		var	curCompAKey	= compKey[j]
		var	aKey		= $("#C0_"+curCompAKey).data("key")
		var curCol		= $("#C"+i+"_"+curCompAKey)

		if (aKey != "") {
			// do not allow editing of Assignment Name(Task) and Assign To for existing assignment
			if (i==0 || i==2) {
				if ($("#C5_"+curCompAKey).data("key") != 1)
					continue
			}
			else if (i==1) {
				// do not allow editing of Due Date if no status is inserted
				if ($("#CT1_"+curCompAKey).length ==0)
					continue
				else {
					// do not allow editing of Due Date if current Status is not SPK Retake or DIR Retake
					var	curKey	= $("#C5_"+curCompAKey).data("key")
					// This is using StatusKey
					// <SPK Approve, Lead Note, Extend Due Date, Msc Retake, Serious Mistake
					if (!(curKey<4 || curKey==8 || curKey==10 || curKey==13 || curKey==16))
						continue
				}
			}

			// Create duplicated row. Original row is meant for new Status insertion
			if ($("#CT1_"+curCompAKey).length==0)
				ass_duplicateRow(curCompAKey)
		}
		else {
			// set to New Task if no task is previously assigned
			if ($("#C5_"+curCompAKey).data("key")=="")
				ass_setStatus(curCompAKey,1)

			// set to dirty row if current field is the status field
			if (i==5) {
				ass_addDirtyRow(curCompAKey)
				continue
			}
		}

		if (i==5) {
			curIdx		= idx
			//curSText	= curText

			if (!ass_verifyStatus(curCompAKey,idx)) {
				curIdx		= 1;
				//curSText	= $("#AA_statusList option:eq(" + curIdx + ")").attr("text")
			}

			//curCol.text(curSText)
			ass_setStatus(curCompAKey, curIdx)
		}
		else if (i==6) {
			curCol.data("rem", curText)
			ass_formatRemarks(curCompAKey)
		}
		else
			curCol.text(curText)

		if (i==2)
			curCol.data("key",curVal)

		ass_addDirtyRow(curCompAKey)
	}

	NEED_SAVE	= true
}

function ass_duplicateRow(j) {
    console.log("ass_duplicateRow: "+j);
	var	$curRow	= $("#R_"+j)
	var	len	= $curRow.children().length
	str	= "<tr id='RT_"+j+"' style='font-style:italic;'"
	if ($curRow.hasClass('spk-row'))
		str	+= " class='spk-row'"
	else
		str	+= " class='spk-dRow'"
	str	+= ">"

	for (k=0; k<len; k++) {
		str		+= "<td class='spk-cell "

		if (k>(len-10)) { //8 RF
			var	Cidx	= Math.abs(len-7-k)
			if(k==5){
				Cidx = 7
			} else if (k==6) {
				Cidx = 8
			}

			if (Cidx==6){
				str		+= " remarks-cell'"
			}else{
				str		+= "'"
			}

			str	+= " id='CT"+Cidx+"_"+j+"'"

			if (Cidx==5)
				str	+= " style='font-weight:bold;color:"+$("#C5_"+j).css("color")+";background-color:"+$("#C5_"+j).css("background-color")+"'"
			else if (Cidx==6)
				str	+= " style='text-align:justify'"
			str	+= ">"

			if (k>(len-10)){
               if (k==6) {
                    $excelUploadDigValue = getSPKCookie("SPK_AA_ExcelUploadAT");
                    if($excelUploadDigValue != "" && $excelUploadDigValue ==1){
                        var reTakeRndval = getSPKCookie("retakeRoundVal")
                         str	+= $("#C"+Cidx+"_"+j).html()
                         $("#C"+Cidx+"_"+j).html(reTakeRndval)
                    }else{
                        str	+= $("#C"+Cidx+"_"+j).html()
                    }
                } else{
                    str	+= $("#C"+Cidx+"_"+j).html()
                }
            }
		}else{
			str		+= "'"
		}

		str	+= "</td>"
	}
	str	+= "</tr>"

	$curRow.after(str)
	//$curRow.css("font-weight","bold")

	for (k=3; k<7; k++)
		$("#C"+k+"_"+j).text("")

	$("#CT0_"+j).data("key", $("#C0_"+j).data("key"))
	$("#CT2_"+j).data("key", $("#C2_"+j).data("key"))
	$("#CT5_"+j).data("key", $("#C5_"+j).data("key"))
	$("#CT6_"+j).data("rem", $("#C6_"+j).data("rem"))

	$("#C6_"+j).data("rem", "")

	//ass_resize()
	ass_addDirtyRow(j)
	//ass_clearStatus(j)
}

function ass_removeRow(j) {
	var	aKey	= $("#C0_"+j).data("key")
	if ($("#CT0_"+j).length>0)
		aKey	= $("#CT0_"+j).data("key")

	if (aKey == "") {
		for (i=0; i<7; i++)
			$("#C"+i+"_"+j).text("")

		$("#C0_"+j).data("key", "")
		$("#C2_"+j).data("key", "")
		$("#C5_"+j).data("key", "")

		ass_clearStatus(j)
	}
	else if ($("#RT_"+j).length>0) {
		for (i=0; i<7; i++)
			$("#C"+i+"_"+j).text($("#CT"+i+"_"+j).text())

		$("#C0_"+j).data("key", $("#CT0_"+j).data("key"))
		$("#C2_"+j).data("key", $("#CT2_"+j).data("key"))
		$("#C6_"+j).data("rem", $("#CT6_"+j).data("rem"))

		var	statKey	= $("#CT5_"+j).data("key")


		//var	$curOpt	= $("#AA_statusList option:eq(" + statKey + ")")
		var	$curOpt	= $("#AA_statusList option[value=" + statKey + "]")
		var val		= $curOpt.prop("value")

		//alert("statKey:" + statKey + " val:" + val)

		ass_setStatusByKey(j, statKey)

		$("#RT_"+j).remove()
	}

	ass_removeDirtyRow(j)
}

function ass_addDirtyRow(j) {
	//var	tmp_asKey	= j.split("_")
	//AUTOTRIGGER_ROW[AUTOTRIGGER_ROW.length]	= tmp_asKey[1]
	if (searchArray(AFFECTED_ROW, j)<0) {
		AFFECTED_ROW[AFFECTED_ROW.length]	= j
		$("#R_"+j).addClass("spk-dirtyRow")
	}
}

function ass_removeDirtyRow(j) {
	var	idx	= searchArray(AFFECTED_ROW, j)
	if (idx>=0) {
		//AUTOTRIGGER_ROW.splice(idx,1)
		AFFECTED_ROW.splice(idx,1)
		$("#R_"+j).removeClass("spk-dirtyRow","0")
	}
}

function ass_submitAssetImage(i, j, aKey) {
	var	uKey		= getSPKCookie("SPK_CurUserKey")

	var	myUpload	= $(".spk-fileUpload").fineUploader({
		request: {
			endpoint: '/php/uploadAssetImage.php',
			params : {
				compKey : j,
				assKey : aKey,
				userKey : uKey
			}
		},
		multiple: true,
		validation: {
			allowedExtensions: ['jpeg', 'jpg', 'png', 'bmp', 'gif', 'mov'],
			acceptFiles: 'jpeg, jpg, png, bmp, gif, mov'
		},
		text: {
			uploadButton: 'Browse or drop your images/videos here\n(jpeg, jpg, png, bmp, gif, mov)'
		},
		autoUpload: true,
		failedUploadTextDisplay: {
			mode: 'custom',
			maxChars: 40,
			responseProperty: 'error',
			enableTooltip: true
		},
		debug: true
	}).on('complete', function(event, id, fileName, responseJSON) {
		if (responseJSON.success) {
			iName	= fileName.replace(/\./g, '_')
			iName	= iName.replace(/\(/g, '_')
			iName	= iName.replace(/\)/g, '_')
			iName	= iName.replace(/\&/g, '_')
			var	tmp	= fileName.split(".")
			var	fileType	= tmp[tmp.length-1]

			if($("#"+iName).prop('id') == null) {
				if (fileType == 'mov') {
					var	str	= createQuickTimePlayerControlStr(0, iName, '240', '', (responseJSON.imgPath + encodeURIComponent(fileName)), 'true', 'false', 'true', 'false', 'false', 'false', '#000000', 'ASPECT')
					// TODO Add HTML5 Player here
					$(this).append(str)
				}
				else
					$(this).append('<img id="' + iName + '" class="spk-thumbnail4" src="'+ responseJSON.imgPath + encodeURIComponent(fileName) + '" style="width:240px" alt="' + fileName + '"></img>');

			}
			else {
				$("#"+iName).attr('src', (responseJSON.imgPath + encodeURIComponent(fileName)))
				$("#"+iName).attr('alt', (responseJSON.imgPath + fileName))
			}
		}
	}).on('submit', function(event, id, fileName) {
		$(".spk-fileUpload").fineUploader('setParams', {
			compKey : j,
			assKey : aKey,
			userKey : uKey
		})
	})

	var $dialog 	= $("#AS_FileUploadDialog")
	$dialog.dialog({
		width : '90%',
		height : 800,
		buttons: {
			"Cancel":function(){
				$dialog.dialog("close")
				//ass_getContent()
			},
			"Reset":function(){
				$("#FileUploadSec").fineUploader('reset')
				$.getJSON(
					"/php/deleteAssetImage.php", {
						compKey : j,
						assKey : aKey,
						userKey : uKey
					},
					function(data) {}
				)
			},
			"Submit":function(){
				var	rem	= $("#AS_FileUploadRemarkFld").val()
				var	keepFileName	= 1
				if (!$("#AA_FU_KeepFileName").prop("checked"))
					keepFileName	= 0

				$.getJSON(
					"/php/submitAssetImage.php", {
						compKey : j,
						assKey : aKey,
						userKey : uKey,
						remark : rem,
						kTN : keepFileName
					},
					function(data) {
						NEED_SAVE	= false
						$dialog.dialog("close")
						appendStatus(data)
						ass_getContent()
					}
				)
				////////inProgress()
			}
		},
		close: function( event, ui ) {
			UPLOAD_DIALOG_OPEN	= 0
			$("#FileUploadSec").fineUploader('reset')
			$.getJSON(
				"/php/deleteAssetImage.php", {
					compKey : j,
					assKey : aKey,
					userKey : uKey
				},
				function(data) {}
			)
			ass_removeRow(j+"_"+aKey)
		}
	})

	$dialog.dialog("open")
}

function ass_setStatus(j, idx) {
	var	$curList= $("#AA_statusList")
	//var	curIdx	= $curList.attr("selectedIndex")
	var	curIdx	= $curList.prop("selectedIndex")
	// set to 0 to restore the bgcolor of current selection
	//$curList.attr("selectedIndex",0)
	$curList.prop("selectedIndex",0)

	//var	statList	= $("#AA_MAIN").data("StatusList")

	var	$curOpt	= $("#AA_statusList option:eq(" + idx + ")")
	tColor	= $curOpt.css("color")
	bgColor	= $curOpt.css("background-color")
	text	= $curOpt.text()

	var	$curCol	= $("#C5_"+j)
	$curCol.css("font-weight", "bold")
	$curCol.css("color", tColor)
	$curCol.css("background-color", bgColor)
	$curCol.text(text)

	//var statKey = $curOpt.attr("value")
	var statKey = $curOpt.prop("value")

	$curCol.data("key", statKey)

	if (idx==1) {
		$("#C0_"+j).data("key", "")
		if ($("#CT0_"+j).length==0) {
			$("#C2_"+j).data("key", "")

			$("#C0_"+j).text("")
			$("#C1_"+j).text("")
			$("#C2_"+j).text("")
		}
	}

	// set back to original selected index from 0
	//$curList.attr("selectedIndex",curIdx)
	$curList.prop("selectedIndex",curIdx)
}

function ass_setStatusByKey(j, key) {
	var	$curList= $("#AA_statusList")
	//var	curIdx	= $curList.attr("selectedIndex")
	var	curIdx	= $curList.prop("selectedIndex")
	// set to 0 to restore the bgcolor of current selection
	//$curList.attr("selectedIndex",0)
	$curList.prop("selectedIndex",0)

	var	statList	= $("#AA_MAIN").data("StatusList")
	var	idx			= statList['StatusKey'].indexOf(key.toString())
	//var	$curOpt	= $("#AA_statusList option:eq(" + key + ")")
	tColor	= statList['TextColor'][idx]
	bgColor	= statList['StatusColor'][idx]
	text	= statList['StatusType'][idx]

	var	$curCol	= $("#C5_"+j)
	$curCol.css("font-weight", "bold")
	$curCol.css("color", tColor)
	$curCol.css("background-color", bgColor)
	$curCol.text(text)

	//var statKey = $curOpt.attr("value")
	//var statKey = $curOpt.prop("value")

	$curCol.data("key", key)

	if (key==1) {
		$("#C0_"+j).data("key", "")
		if ($("#CT0_"+j).length==0) {
			$("#C2_"+j).data("key", "")

			$("#C0_"+j).text("")
			$("#C1_"+j).text("")
			$("#C2_"+j).text("")
		}
	}
	console.log("assignment id:")
	console.log(j)
	//var assKey = j.split("_");
	//console.log(assKey[1])
	//var curAssStatus = getAssStatusKey(assKey[1]);
	//console.log("curAssStatus: ")
	//console.log(curAssStatus)

	// set back to original selected index from 0
	//$curList.attr("selectedIndex",curIdx)
	$curList.prop("selectedIndex",curIdx)
}

function ass_clearStatus(j) {
	$("#C5_"+j).css("background-color", "inherit")
}

function ass_verifyStatus(j, newStatKey) {
	var	aKey	= $("#C0_"+j).data("key")
	if (aKey=="") {
		if (newStatKey != 1) {
			ass_clearStatus(j)
			/*var	assType	= getSPKCookie("SPK_AA_CurAssignType")

			 aStr	= "No assignment was created for ["
			 if (assType=="Shot")
			 aStr	+= "Shot "
			 aStr	+= $("#C_"+j).text() + "] before. Only \"New Task\" is allowed."
			 alert(aStr)
			 return	0*/
		}
	}
	/*
	 aKey	= $("#C0_"+j).data("key")
	 if (newStatKey==1) {

	 }*/

	return	1
}

function ass_clearSelectedAssignment() {
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		//if ($(this).attr("checked"))
		if ($(this).prop("checked"))
			sCompKey[sCompKey.length]	= $(this).val()
	})

	for (index in sCompKey)
		ass_removeRow(sCompKey[index])

	//ass_resize()
}

function ass_getUserTeam() {
	$.getJSON(
		"/php/getUserTeam.php", {},
		function(data) {ass_getUserTeam_CB(data)}
	)

	////////inProgress()
}

function ass_getUserTeam_CB(data) {
	var	curUTeam		= getSPKCookie("SPK_AA_ASCurUserTeam")
	data.TeamName.unshift("ALL")
	CreateOptionPair("AA_assignTeamList", data.TeamName, data.TeamName, curUTeam)

	var	newUTeam		= $("#AA_assignTeamList").val()
	if (curUTeam != newUTeam)
		setSPKCookie("SPK_AA_ASCurUserTeam", newUTeam)

	ass_getTeamUserList()
}

function ass_getStatusList() {
	var	pKey	= getSPKCookie("SPK_CurProject")
	var	orBy	= "SortOrder"
	var	or		= "ASC"

	$.getJSON("/php/getStatusList.php", {
		orderBy:orBy,
		ord:or
	}, function(data) {ass_getStatusList_CB(data)})
	////////inProgress()
}

function ass_getStatusList_CB(data) {
	if (data.StatusKey != null) {
		data.StatusType.unshift("-")
		data.StatusKey.unshift("-")
		CreateOptionPair("AA_statusList", data.StatusKey, data.StatusType, "")

		for (i=1;i<data.StatusKey.length; i++)
			$("#AA_statusList option:eq(" + i + ")").css({"color":data.TextColor[i-1],"background-color":data.StatusColor[i-1]})

		var	uGrpKey	= getSPKCookie('SPK_CurUserGroupKey')
		if (uGrpKey<3)
			for (i=1; i<data.StatusKey.length; i++) {
				var curStat	= data.StatusKey[i];
				// This is using StatusKey
				//  < Submission, > Note, 	! ITR Submission, !Hold, 		!WIP
				if ((curStat<6 || curStat>7) && curStat!=14 && curStat!=19 && curStat!=20)
					$("#AA_statusList option:eq(" + i + ")").hide()
			}
	}
	else
		ClearOptions("AA_statusList")

	//ass_resizeCol()
	////endProgress()
}

function ass_statusInvert() {
	if ($("#AA_StatusListInvChkBox").prop("checked"))
		setSPKCookie("SPK_AA_CurStatusListInv", 'TRUE')
	else
		setSPKCookie("SPK_AA_CurStatusListInv", 'FALSE')

	ass_resetScroll()
	ass_getContent()

}

function ass_matchAllSelectedComponents() {
	// alert("ass_matchAllSelectedComponents")
	if($("#AssetOption").is(":visible")){
		if ($("#AA_TypeListMatchAllSelectedAssetComponentsChkBox").prop("checked"))
			setSPKCookie("SPK_AA_MatchAllSelectedComponents", 'TRUE')
		else
			setSPKCookie("SPK_AA_MatchAllSelectedComponents", 'FALSE')
	} else if ($("#ShotOption").is(":visible")){
		if ($("#AA_TypeListMatchAllSelectedShotComponentsChkBox").prop("checked"))
			setSPKCookie("SPK_AA_MatchAllSelectedComponents", 'TRUE')
		else
			setSPKCookie("SPK_AA_MatchAllSelectedComponents", 'FALSE')
	}


	ass_resetScroll()
	ass_getContent()
}

function ass_changeOrder(curFld) {
	var	preOrBy	= getSPKCookie("SPK_AA_OrderBy")

	setSPKCookie("SPK_AA_OrderBy", curFld)

	var	ord	= getSPKCookie("SPK_AA_Order")

	if (preOrBy==curFld) {
		if (ord == "" || ord == "DESC")
			setSPKCookie("SPK_AA_Order", "ASC")
		else
			setSPKCookie("SPK_AA_Order", "DESC")
	}
	else {
		if (curFld.match(/Date/g) != null)
			setSPKCookie("SPK_AA_Order", "DESC")
		else if (curFld.match(/Level/g) != null)
			setSPKCookie("SPK_AA_Order", "ASC")
	}

	ass_resetScroll()
	ass_getContent();
}

function ass_changePage(page) {
	setSPKCookie("SPK_AA_Page", page)

	ass_resetScroll()
	ass_getContent();
}

function ass_dueDateChange(control) {
	ass_checkDueDate(control)
}

function ass_checkDueDate(control) {
	var	dueDate	= $("#"+control).datetimepicker("getDate")

	if (dueDate == null || '')
		return

	var	today	= new Date()
	var	diff	= dueDate - today

	if (diff<0) {
		alert("Due date and time must not be earlier than current date and time.")
		$("#"+control).val('')
		return
	}

	var	dateStr	= getDateTimeString(dueDate) + ' ' + GetCookie('SPK_TIMEZONESTR')
}

function ass_statusFilChanged() {
	var	curStat	= $("#AA_statusFilList").val()
	setSPKCookie("SPK_AA_CurStatus", curStat)

	ass_resetScroll()
	ass_getContent()
}

function ass_statusChange(curList) {
    assignManager.events.statusChanged($("#"+curList))
}

function ass_statOptionChange() {
	var	curStat	= $("#AA_statOptionList").val()
	setSPKCookie("SPK_AA_CurStatOption", curStat)

	ass_getContent()
}

function ass_statAssetTagChange() {
	if ($("#AA_statAssetTagChkBox").prop("checked"))
		setSPKCookie("SPK_AA_CurStatAssetTag", 'TRUE')
	else
		setSPKCookie("SPK_AA_CurStatAssetTag", 'FALSE')

	ass_getContent()
}

function ass_statUserChange() {
	if ($("#AA_statUserChkBox").prop("checked"))
		setSPKCookie("SPK_AA_CurStatUser", 'TRUE')
	else
		setSPKCookie("SPK_AA_CurStatUser", 'FALSE')

	ass_getContent()
}

function ass_calendarOptionChange() {
	var	curStat	= $("#AA_CalenderOptionList").val()
	setSPKCookie("SPK_AA_CalendarOption", curStat)

	ass_getContent()
}

function ass_dataOptionChange() {
	var	curStat	= $("#AA_DataOptionList").val()
	setSPKCookie("SPK_AA_DataOption", curStat)

	ass_getContent()
}

function ass_modeOptionChange() {
	var	curStat	= $("#AA_ModeOptionList").val()
	setSPKCookie("SPK_AA_ModeOption", curStat)

	ass_getContent()
}

//Rajesh Fithelis
//TobotVS2 Sync Final Files into client folder for SG on DIR Submission
//copyFinalFilesToClientFldSG
function copyFinalFilesToClientFldSG() {
	console.log("TBVS2 client RF button pressed!");
	console.log("assignment2.3.js: copyFinalFilesToClientFldSG");
	var	aCompKeys	= new Array();
	var selRows = new Array();
	var rowCnt = 1;
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_");
			aCompKeys[aCompKeys.length]	= temp[0];
			selRows[selRows.length] = rowCnt;//get the selected shot's number
		}
		rowCnt++;
	})
	console.log("selected asset component keys");
	console.log(aCompKeys);
	var sComKeyStr = aCompKeys.toString();

    var curUser     = getSPKCookie("SPK_CurUserKey")
    var curPKey     = getSPKCookie("SPK_CurProject")
    //var compKeys    = new Array()
    //compKeys[0]     = getSPKCookie("SPK_AS_CurComponentKey")

    $.getJSON(
        // need to edit this to add projectKey
        "php/copyFinalFilesToClientFldSG.php", {
            pKey            : curPKey,
            'compKeys[]'    : aCompKeys,
            userKey         : curUser
        },
        function(data) {copyFinalFilesToClientFldSG_CB(data)}
    )

    inProgress()
}

function copyFinalFilesToClientFldSG_CB(data) {
	console.log(data.sourcePath);
	console.log(data.sFile);
	console.log(data.f_tPath);
    appendStatus(data)
    endProgress()
}


//Rajesh Fithelis Status Change Testing
function ass_saveAssetAT() {
	console.log("ass_saveAssetAT call...");
	var	keys			= new Array()
	var	aKeys			= new Array()
	var	newTask			= new Array()
	var	newDueDate		= new Array()
	var	newAssignTo		= new Array()
	var	newStatus		= new Array()
	var	newRemarks		= new Array()
	var at_assKeys		= new Array()

	if (AFFECTED_ROW.length == 0)
		return;
	var	cnt	= 0
	for (index in AFFECTED_ROW) {
		var	curRow	= AFFECTED_ROW[index]
		var	temp	= curRow.split("_")
		keys[cnt]	= temp[0]

		for (i=0; i<7; i++) {
			if (i==3 || i==4)
				continue;

			var	val		= ""
			var	text	= $("#C" + i + "_" + curRow).text()

			if (i==0 || i==2 || i==5)
				val	= $("#C" + i + "_" + curRow).data("key")
			else if (i==6)
				val	= $("#C" + i + "_" + curRow).data("rem")

			if (text=="" && i!=6) {
				alert("Please fill in value for this field")
				var	temp	= curRow.split("_")
				ass_addColumnInput(i, temp[0], temp[1])
				$("#AA_tempInput").focus()
				$("#AA_tempInput").effect('pulsate',500)
				return
			}

			if (i==1) {
				var	temp	= text.split(' ')
				var	temp2	= temp[0].split('-')
				var	temp3	= temp[1].split(':')
				var today	= new Date()
				var dueDate	= new Date()

				dueDate.setFullYear(temp2[0], (temp2[1]-1), temp2[2])
				dueDate.setHours(temp3[0])
				dueDate.setMinutes(temp3[1])
				dueDate.setSeconds(temp3[2])

				var	curKey	= $("#C5_"+curRow).data("key")
				// This is using StatusKey
				// <SPK Approve, Lead Note, Extend Due Date, Msc Retake, Serious Mistake
				if (curKey<4 || curKey==8 || curKey==10 || curKey==13 || curKey==16) {
					if (dueDate<today) {
						alert("Please provide a valid due date!")
						temp	= curRow.split("_")
						ass_addColumnInput(i, temp[0], temp[1])
						$("#AA_tempInput").focus()
						$("#AA_tempInput").effect('pulsate',500)

						return
					}
				}
			}

			switch (i) {
				case 0:
					newTask[cnt]		= text
					aKeys[cnt]			= val
					break;
				case 1:
					//var	buffer	= text.split(" ")
					//newDueDate[cnt]	= buffer[0]
					newDueDate[cnt]		= text
					break;
				case 2:
					newAssignTo[cnt]	= val
					break;
				case 5:
					newStatus[cnt]		= val
					break;
				case 6:
					newRemarks[cnt]		= val
					break;
			}
		}
		cnt++;
	}


	var	curUsrKey	= getSPKCookie("SPK_UP_CurUserKey");
		console.log("updateAutoTrigger.php -condition")

		var	assType	= getSPKCookie("SPK_AA_CurAssignType")
		var	pKey	= getSPKCookie("SPK_CurProject")

		var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
		if (pKey=="ALL")
			maxLvl	= 4
		var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
		var	sComp	= sCompStr.split(",")
		if (searchArray(sComp, "ALL")>=0)
			sComp	= ["ALL"]

		var	shotLevel	= new Array()
		if (pKey=="ALL")
			for (i=0; i<maxLvl; i++)
				shotLevel[i]	= "ALL"
		else {
			for (i=1; i<maxLvl; i++) {
				var	temp		= ""
				temp	+= getSPKCookie("SPK_AA_ShotLevelNum" + i)
				shotLevel[i-1]	= temp.replace(/\,/g, " ")
			}
		}
		console.log("updateAutoTrigger.php - start")
		STARTTIME	= new Date();
	inProgress()
	var	uKey	= getSPKCookie("SPK_CurUserKey")
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	$.post(
		"/php/saveAssetAT.php", {
			'curUser':uKey,
			'keys[]':keys,
			'aKeys[]':aKeys,
			'newTask[]':newTask,
			'newDueDate[]':newDueDate,
			'newAssignTo[]':newAssignTo,
			'newStatus[]':newStatus,
			'newRemarks[]':newRemarks,
			'assignment':assType,
			'projKey':pKey
		},
		function(data) {
			ass_saveAssetAT_CB(data)
		},
		'json'
	)
}

function ass_saveAssetAT_CB(data) {
	appendStatus(data)
	if (!data.Abort) {
		NEED_SAVE	= false
		ass_getAssignment()
	}
	ass_autoRefreshChange()
	endProgress()
}


//Rajesh Fithelis Status Change Testing
function ass_saveAssignmentRF() {
	console.log("assignment.2.3.js: ass_saveAssignmentRF()");
	var	keys			= new Array()
	var	aKeys			= new Array()
	var	newTask			= new Array()
	var	newDueDate		= new Array()
	var	newAssignTo		= new Array()
	var	newStatus		= new Array()
	var	newRemarks		= new Array()
	var at_assKeys		= new Array()
	var nRetakeType 	= new Array()
	var nRetakeRound 	= new Array()

	if (AFFECTED_ROW.length == 0)
		return;
	/*for (index in AUTOTRIGGER_ROW) {
		var	curRow	= AUTOTRIGGER_ROW[index]
		var	temp	= curRow.split("_")
		at_assKeys[at_assKeys.length]	= temp[0]
	}*/
	var	cnt	= 0
	for (index in AFFECTED_ROW) {
		var	curRow	= AFFECTED_ROW[index]
		var	temp	= curRow.split("_")
		keys[cnt]	= temp[0]

		for (i=0; i<9; i++) { //7 RF
			if (i==3 || i==4)
				continue;

			var	val		= ""
			var	text	= $("#C" + i + "_" + curRow).text()
			//if(i==7 || i==8)
				//alert("Test: "+text)
			if (i==0 || i==2 || i==5){
				val	= $("#C" + i + "_" + curRow).data("key")
			}
			else if (i==6)
				val	= $("#C" + i + "_" + curRow).data("rem")

			if (text=="" && i!=6) {
				alert("Please fill in value for this field")
				var	temp	= curRow.split("_")
				ass_addColumnInput(i, temp[0], temp[1])
				$("#AA_tempInput").focus()
				$("#AA_tempInput").effect('pulsate',500)
				return
			}

			if (i==1) {
				var	temp	= text.split(' ')
				var	temp2	= temp[0].split('-')
				var	temp3	= temp[1].split(':')
				var today	= new Date()
				var dueDate	= new Date()

				dueDate.setFullYear(temp2[0], (temp2[1]-1), temp2[2])
				dueDate.setHours(temp3[0])
				dueDate.setMinutes(temp3[1])
				dueDate.setSeconds(temp3[2])

				var	curKey	= $("#C5_"+curRow).data("key")
				// This is using StatusKey
				// <SPK Approve, Lead Note, Extend Due Date, Msc Retake, Serious Mistake
				if (curKey<4 || curKey==8 || curKey==10 || curKey==13 || curKey==16) {
					if (dueDate<today) {
						alert("Please provide a valid due date!")
						temp	= curRow.split("_")
						ass_addColumnInput(i, temp[0], temp[1])
						$("#AA_tempInput").focus()
						$("#AA_tempInput").effect('pulsate',500)

						return
					}
				}
			}

			switch (i) {
				case 0:
					newTask[cnt]		= text
					aKeys[cnt]			= val
					break;
				case 1:
					//var	buffer	= text.split(" ")
					//newDueDate[cnt]	= buffer[0]
					newDueDate[cnt]		= text
					break;
				case 2:
					newAssignTo[cnt]	= val
					break;
				case 5:
					newStatus[cnt]		= val
					break;
				case 6:
					newRemarks[cnt]		= val
					break;
				case 7:
					nRetakeType[cnt]		= text
					//alert(text)
					break;
				case 8:
					nRetakeRound[cnt]		= text
					//alert(text)
					break;
			}
		}
		/*
		 if (newStatus[cnt] > 3)
		 newDueDate[cnt]	= ""
		 else {
		 var	buffer	= newDueDate[cnt].split(" ")
		 newDueDate[cnt]	= buffer[0]
		 }*/
		cnt++;
	}


	var	curUsrKey	= getSPKCookie("SPK_UP_CurUserKey");
	//if(curUsrKey==905){
		//setSPKCookie("SPK_AA_ExcelUploadAT", 1)
		console.log("updateAutoTrigger.php -condition")

		var	assType	= getSPKCookie("SPK_AA_CurAssignType")
		var	pKey	= getSPKCookie("SPK_CurProject")

		var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
		if (pKey=="ALL")
			maxLvl	= 4
		var	sCompStr= getSPKCookie("SPK_AA_CurShotComp") + ''
		var	sComp	= sCompStr.split(",")
		if (searchArray(sComp, "ALL")>=0)
			sComp	= ["ALL"]

		var	shotLevel	= new Array()
		if (pKey=="ALL")
			for (i=0; i<maxLvl; i++)
				shotLevel[i]	= "ALL"
		else {
			for (i=1; i<maxLvl; i++) {
				var	temp		= ""
				temp	+= getSPKCookie("SPK_AA_ShotLevelNum" + i)
				shotLevel[i-1]	= temp.replace(/\,/g, " ")
			}
		}
		console.log("updateAutoTrigger.php - start")
		STARTTIME	= new Date();
	//}
	inProgress()
	var	uKey	= getSPKCookie("SPK_CurUserKey")
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	//var retakeDept = getSPKCookie("SPK_Excel_Retake_Dept");
	//var retakeValue = getSPKCookie("SPK_Excel_RetakeValue");

	//if(uKey == 905){
	$.post(
		"/php/saveAssignmentRF.php", {
			'curUser':uKey,
			'keys[]':keys,
			'aKeys[]':aKeys,
			'newTask[]':newTask,
			'newDueDate[]':newDueDate,
			'newAssignTo[]':newAssignTo,
			'newStatus[]':newStatus,
			'newRemarks[]':newRemarks,
			'newSetRetakeType[]':nRetakeType,
			'newRetakeRound[]':nRetakeRound,
			'assignment':assType,
			'projKey':pKey,
			'maxLevel':maxLvl,
			'shotLevel[]':shotLevel,
			//'retakeDept[]':retakeDept,
			//'retakeValue[]':retakeValue,
			'chkBx_assetfix': getSPKCookie("SPK_AA_AssetFixChkBox"),
			'chkBx_blocking': getSPKCookie("SPK_AA_BlockingChkBox"),
			'chkBx_animation': getSPKCookie("SPK_AA_AnimationChkBox"),
			'chkBx_lighting': getSPKCookie("SPK_AA_LightingChkBox"),
			'chkBx_effect': getSPKCookie("SPK_AA_EffectChkBox"),
			'chkBx_excelUploadAT': getSPKCookie("SPK_AA_ExcelUploadAT")
		},
		function(data) {
			setSPKCookie("SPK_AA_ExcelUploadAT", 0)
			setSPKCookie("SPK_AA_AssetFixChkBox", 0)
			setSPKCookie("SPK_AA_BlockingChkBox", 0)
			setSPKCookie("SPK_AA_AnimationChkBox", 0)
			setSPKCookie("SPK_AA_LightingChkBox", 0)
			setSPKCookie("SPK_AA_EffectChkBox", 0)
			ass_saveAssignment_CBRF(data)
		},
		'json'
	)
	//}
	/*else{
		$.post(
			"/php/saveAssignmentRF.php", {
				'curUser':uKey,
				'assignment':assType,
				'keys[]':keys,
				'aKeys[]':aKeys,
				'newTask[]':newTask,
				'newDueDate[]':newDueDate,
				'newAssignTo[]':newAssignTo,
				'newStatus[]':newStatus,
				'newRemarks[]':newRemarks
			},
			function(data) {
				ass_saveAssignment_CBRF(data)
			},
			'json'
		)
	}*/

	////////inProgress()
}

function ass_saveAssignment_CBRF(data) {
	setSPKCookie("SPK_AA_ExcelUploadAT", 0)
	setSPKCookie("SPK_AA_AssetFixChkBox", 0)
	setSPKCookie("SPK_AA_BlockingChkBox", 0)
	setSPKCookie("SPK_AA_AnimationChkBox", 0)
	setSPKCookie("SPK_AA_LightingChkBox", 0)
	setSPKCookie("SPK_AA_EffectChkBox", 0)
	appendStatus(data)
	if (!data.Abort) {
		NEED_SAVE	= false
		ass_getAssignment()
	}
	ass_autoRefreshChange()
	endProgress()
}

function ass_saveAssignment() {
	console.log("DB Testing...");
	var	keys			= new Array()
	var	aKeys			= new Array()
	var	newTask			= new Array()
	var	newDueDate		= new Array()
	var	newAssignTo		= new Array()
	var	newStatus		= new Array()
	var	newRemarks		= new Array()

	if (AFFECTED_ROW.length == 0)
		return;

	var	cnt	= 0
	for (index in AFFECTED_ROW) {
		var	curRow	= AFFECTED_ROW[index]
		var	temp	= curRow.split("_")
		keys[cnt]	= temp[0]

		for (i=0; i<7; i++) {
			if (i==3 || i==4)
				continue;

			var	curUsrKey	= getSPKCookie("SPK_UP_CurUserKey");
			var	val		= ""
			var	text	= $("#C" + i + "_" + curRow).text()
			if (i==0 || i==2 || i==5)
				val	= $("#C" + i + "_" + curRow).data("key")
			else if (i==6)
				val	= $("#C" + i + "_" + curRow).data("rem")

			if (text=="" && i!=6) {
				alert("Please fill in value for this field")
				var	temp	= curRow.split("_")
				ass_addColumnInput(i, temp[0], temp[1])
				$("#AA_tempInput").focus()
				$("#AA_tempInput").effect('pulsate',500)
				return
			}

			if (i==1) {
				var	temp	= text.split(' ')
				var	temp2	= temp[0].split('-')
				var	temp3	= temp[1].split(':')
				var today	= new Date()
				var dueDate	= new Date()

				dueDate.setFullYear(temp2[0], (temp2[1]-1), temp2[2])
				dueDate.setHours(temp3[0])
				dueDate.setMinutes(temp3[1])
				dueDate.setSeconds(temp3[2])

				var	curKey	= $("#C5_"+curRow).data("key")
				// This is using StatusKey
				// <SPK Approve, Lead Note, Extend Due Date, Msc Retake, Serious Mistake
				if (curKey<4 || curKey==8 || curKey==10 || curKey==13 || curKey==16) {
					if (dueDate<today) {
						alert("Please provide a valid due date!")
						temp	= curRow.split("_")
						ass_addColumnInput(i, temp[0], temp[1])
						$("#AA_tempInput").focus()
						$("#AA_tempInput").effect('pulsate',500)

						return
					}
				}
			}

			switch (i) {
				case 0:
					newTask[cnt]		= text
					aKeys[cnt]			= val
					break;
				case 1:
					//var	buffer	= text.split(" ")
					//newDueDate[cnt]	= buffer[0]
					newDueDate[cnt]		= text
					break;
				case 2:
					newAssignTo[cnt]	= val
					break;
				case 5:
					newStatus[cnt]		= val
					break;
				case 6:
					newRemarks[cnt]		= val
					break;
			}
		}
		/*
		 if (newStatus[cnt] > 3)
		 newDueDate[cnt]	= ""
		 else {
		 var	buffer	= newDueDate[cnt].split(" ")
		 newDueDate[cnt]	= buffer[0]
		 }*/

		cnt++;
	}

	var	uKey	= getSPKCookie("SPK_CurUserKey")
	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	$.post(
		"/php/saveAssignment.php", {
			curUser:uKey,
			assignment:assType,
			'keys[]':keys,
			'aKeys[]':aKeys,
			'newTask[]':newTask,
			'newDueDate[]':newDueDate,
			'newAssignTo[]':newAssignTo,
			'newStatus[]':newStatus,
			'newRemarks[]':newRemarks
		},
		function(data) {ass_saveAssignment_CB(data)},
		'json'
	)

	////////inProgress()
}

function ass_saveAssignment_CB(data) {

	appendStatus(data)
	if (!data.Abort) {
		NEED_SAVE	= false
		ass_getAssignment()
	}

	////endProgress()
}

function ass_loadHistory(j,curAKey) {
	if (curAKey=="")
		return;

	if ($("#RH_"+j+"_"+curAKey).length>0) {
		while ($("#RH_"+j+"_"+curAKey).length>0)
			$("#RH_"+j+"_"+curAKey).remove()

		//ass_resize()
		return;
	}

	abortExistingAJAX("/php/getAssignmentHistory.php");
	if (cur_AA_AJAX != null)
		cur_AA_AJAX.abort()

	//setSPKCookie("SPK_AA_CurFocusRow", ("R_"+j+"_"+curAKey))

	cur_AA_AJAX	= $.getJSON(
		"/php/getAssignmentHistory.php", {
			aKey:curAKey
		},
		function(data) {
			appendStatus(data)

			if (data.StatusKey != null) {
				var	$curRow	= $("#RT_"+j+"_"+curAKey)
				if ($curRow.length==0)
					$curRow	= $("#R_"+j+"_"+curAKey)

				var	len	= $curRow.children().length

				var	str	= ""

				var	$curList= $("#AA_statusList")

				for (i=1; i<data.StatusKey.length; i++) {

					str	+= "<tr id='RH_"+j+"_"+curAKey+"' style='font-style:italic;'"

					if ($curRow.hasClass('spk-row'))
						str	+= " class='spk-row'"
					else
						str	+= " class='spk-dRow'"

					str	+= ">"

					var	clsClass	= "'spk-cell spk_dashLine'"
					if (i==(data.StatusKey.length-1))
						clsClass	= "'spk-cell spk_heavyDBLine'"

					for (k=0; k<len-9; k++) //7 Rajesh Fithelis
						str		+= "<td class=" + clsClass + "></td>"
					var	temp	= data.DueDate[i].split(" ")
					str	+= "<td class=" + clsClass + ">"+"C"+data.RetakeType[i]+"</td>"
					str	+= "<td class=" + clsClass + ">"+data.retakeround[i]+"</td>"
					str	+= "<td class=" + clsClass + ">"+data.AssignmentName[i]+"</td>"

					str	+= "<td class=" + clsClass + ">"+temp[0]+"</td>"
					str	+= "<td class=" + clsClass + ">"+data.ToUserName[i]+"</td>"
					str	+= "<td class=" + clsClass + ">"+getDateUTCStr(data.UpdateDate[i])+"</td>"
					str	+= "<td class=" + clsClass + ">"+data.UpUserName[i]+"</td>"

					var	$curOpt	= $("#AA_statusList option[value='" + data.StatusKey[i] + "']")
					tColor	= $curOpt.css("color")
					bgColor	= $curOpt.css("background-color")
					statText= $curOpt.text()

					var	curUsrKey	= getSPKCookie("SPK_UP_CurUserKey");
					//if(curUsrKey==905){
					var remarks = data.Remarks[i];
					var matches = remarks.match(/\[(.*?)\]/);
					var filesList = new Array();
					if(matches){
						var submatch = matches[1];
						filesList = submatch.split(",");
						console.log("files List");
						console.log(filesList);
						var curStd		= getSPKCookie('SPK_STUDIOKEY');
						var targetPath = "";
						if(curStd == 1){
							targetPath = "http://spknet.spkanim.com/proj/UP_Video/Remarks/";
						} else if(curStd == 2){
							targetPath = "http://spknet.mysparky.spkanim.com/proj/UP_Video/Remarks/";
						} else if(curStd == 3){
							targetPath = "http://spknet.spkic.spkanim.com/proj/UP_Video/Remarks/";
						}
						filesList.forEach(function(entry){
							var finalVideoPath = targetPath.trim() + entry.trim();
							console.log(entry);
							var ext = entry.split(".")[1];
							if(ext){
								ext = ext.toLowerCase();
							} else{
								ext ="";
							}
							console.log("extension: "+ext)
							var ext_img_array = ['jpg', 'jpeg', 'png', 'bmp', 'tga', 'psd'];
							var ext_video_array = ['mov', 'mp4'];
							var chk_img = findValueInArray(ext, ext_img_array);
							var chk_vid = findValueInArray(ext, ext_video_array);
							var btnText = "";
							if( chk_img == 1){
								btnText = "show"
							} else if( chk_vid == 1){
								btnText = "play"
							} else{
								btnText = "error"
							}
							remarks = remarks.replace(entry, "<button id='AS_VideoBtn' class='ui-button ui-widget ui-state-default ui-corner-all' style='width:35px;font-size:x-small' onclick='remVideo(\""+finalVideoPath+"\""+ ",\"" + ext +"\")'><strong>" + btnText + "</strong></button>");
						});
					}
					remHTML = assignManager.utils.formatRemarks(remarks)
					/*} else{
						remHTML = assignManager.utils.formatRemarks(data.Remarks[i])
					}*/

					str	+= "<td class=" + clsClass + " style='font-weight:bold;color:"+tColor+";background-color:"+bgColor+"'>"+statText+"</td>"
					str	+= "<td class='spk-cell spk_dashLine remarks-cell' style='text-align:justify'>" + remHTML + "</td>"

					str	+= "</tr>"
				}

				$curRow.after(str)

				//ass_resize()
			}

			////endProgress()
		}
	)

	////inProgress()
}

function ass_setAutoTriggerAssignment() {
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked"))
			sCompKey[sCompKey.length]	= $(this).val()
	})

	var	aKeys		= new Array()
	var	infoStr		= ""
	for (i=0; i<sCompKey.length; i++) {
		var	curKey	= $("#C0_"+sCompKey[i]).data("key")
		if (curKey != "") {
			aKeys[aKeys.length]	= curKey
			infoStr	+= "<div>- "+$("#C_"+sCompKey[i]).text()+" : "+$("#C0_"+sCompKey[i]).text()+"</div>"
		}
	}

	if (aKeys.length<=0)
		return;

	var $dialog 	= $("#AA_setAutoTriggerDialog")

	$("#AS_setAutoTriggerAssignmentSec").html(infoStr)
	$dialog.dialog( {
		width : '300',
		buttons: {
			"Confirm":function(){
				var	priority	= $("#AA_AutoTrigger").val()

				$.post(
					"/php/setAutoTrigger.php", {
						'aKeys[]':aKeys,
						prio:priority
					},
					function(data) {
						if(data.autoTrigger_status == 300){
							alert("Wrong entry for Auto Trigger!")
						} else{
							ass_setAutoTriggerSelectedAssignmentCB(data)
						}
						console.log(data.autoTrigger_status)
					},
					'json'
				)

				////inProgress()
			}
		}
	})
	$dialog.dialog("open")
}

function ass_setAutoTriggerSelectedAssignmentCB(data) {
	//alert(data.SQL)
	$("#AA_setAutoTriggerDialog").dialog("close")
	ass_getAssignment()

	appendStatus(data)
	////endProgress()
}

function ass_setPrioritySelectedAssignment() {
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked"))
			sCompKey[sCompKey.length]	= $(this).val()
	})

	var	aKeys		= new Array()
	var	infoStr		= ""
	for (i=0; i<sCompKey.length; i++) {
		var	curKey	= $("#C0_"+sCompKey[i]).data("key")
		if (curKey != "") {
			aKeys[aKeys.length]	= curKey
			infoStr	+= "<div>- "+$("#C_"+sCompKey[i]).text()+" : "+$("#C0_"+sCompKey[i]).text()+"</div>"
		}
	}

	if (aKeys.length<=0)
		return;

	var $dialog 	= $("#AA_setPriorityDialog")

	$("#AS_setPriorityAssignmentSec").html(infoStr)
	$dialog.dialog( {
		width : '300',
		buttons: {
			"Confirm":function(){
				var	priority	= $("#AA_priority").val()

				$.post(
					"/php/setAssignmentPriority.php", {
						'aKeys[]':aKeys,
						prio:priority
					},
					function(data) {ass_setPrioritySelectedAssignmentCB(data)},
					'json'
				)

				////inProgress()
			}
		}
	})
	$dialog.dialog("open")
}

function ass_setPrioritySelectedAssignmentCB(data) {
	//alert(data.SQL)
	$("#AA_setPriorityDialog").dialog("close")
	ass_getAssignment()

	appendStatus(data)
	////endProgress()
}

function ass_reassignSelectedAssignment() {
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked"))
			sCompKey[sCompKey.length]	= $(this).val()
	})

	var	aKeys		= new Array()
	var	infoStr		= ""
	for (i=0; i<sCompKey.length; i++) {
		var	curKey	= $("#C0_"+sCompKey[i]).data("key")
		if (curKey != "") {
			aKeys[aKeys.length]	= curKey
			infoStr	+= "<div>- "+$("#C_"+sCompKey[i]).text()+" : "+$("#C0_"+sCompKey[i]).text()+"</div>"
		}
	}

	if (aKeys.length<=0)
		return;

	var $dialog 	= $("#AS_reassignAssignmentDialog")

	$("#AS_reassignAssignmentSec").html(infoStr)
	ass_getTaskAutoCompleteList("AA_RA_TaskName")

	$dialog.dialog( {
		width : '45%',
		buttons: {
			"Confirm":function(){
				var	keepTaskName=keepDueDate=keepStatus=makeObs=keepRemark=1

				if (!$("#AA_RA_KeepTaskName").prop("checked"))
					keepTaskName	= 0
				if (!$("#AA_RA_KeepDueDate").prop("checked"))
					keepDueDate		= 0
				if (!$("#AA_RA_KeepStatus").prop("checked"))
					keepStatus		= 0
				if (!$("#AA_RA_MakeObsolete").prop("checked"))
					makeObs			= 0
				if (!$("#AA_RA_CopyRemark").prop("checked"))
					keepRemark		= 0

				var	assignTo		= $("#AA_RA_UserList").val();
				var	taskName=dueDate=status=remarks=''

				if (!keepTaskName) {
					taskName	= $("#AA_RA_TaskName").val();
					if (taskName==null || taskName == "") {
						alert("Please enter a task name.")
						$("#AA_RA_TaskName").effect('pulsate',500)
						return
					}
				}
				if (!keepDueDate) {
					dueDate	= $("#AA_RA_DueDate").val();
					if (dueDate==null || dueDate == "") {
						alert("Please enter a due date.")
						$("#AA_RA_DueDate").effect('pulsate',500)
						return
					}
				}
				if (!keepStatus)
					status	= $("#AA_ReassignStatusFilList").val();
				if (!keepRemark) {
					remarks	= $("#AA_RA_Remarks").val();
					if (remarks==null || remarks == "") {
						alert("Please enter remarks")
						$("#AA_RA_Remarks").effect('pulsate',500)
						return
					}
				}

				var	curUserKey	= getSPKCookie("SPK_CurUserKey")
				var	assType		= getSPKCookie("SPK_AA_CurAssignType")

				dataVars = {	curUser:curUserKey,
								assignment:assType,
								'aKeys[]':aKeys,
								newTask:taskName,
								newDueDate:dueDate,
								newAssignTo:assignTo,
								newStatus:status,
								newRemarks:remarks,
								keepTN:keepTaskName,
								keepDD:keepDueDate,
								keepST:keepStatus,
								mObs:makeObs,
								kRM:keepRemark
							}

				var request = App.AJAX.Request("assignment.reassign", dataVars, "POST",
											ass_reassignSelectedAssignment_CB)

			}
		}
	})
	$dialog.dialog("open")
}

function ass_reassignSelectedAssignment_CB(data) {
	$("#AS_reassignAssignmentDialog").dialog("close")
	$("#AA_RA_TaskName").val('');
	$("#AA_RA_DueDate").val('');
	$("#AA_RA_Remarks").val('');
	ass_getAssignment()

	appendStatus(data)
	////endProgress()
}

function ass_deleteSelectedAssignment() {
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		//if ($(this).attr("checked"))
		if ($(this).prop("checked"))
			sCompKey[sCompKey.length]	= $(this).val()
	})

	var	aKeys		= new Array()
	var	infoStr		= ""
	for (i=0; i<sCompKey.length; i++) {
		var	curKey	= $("#C0_"+sCompKey[i]).data("key")
		if (curKey != "") {
			aKeys[aKeys.length]	= curKey
			infoStr	+= "<div>- "+$("#C_"+sCompKey[i]).text()+" : "+$("#C0_"+sCompKey[i]).text()+"</div>"
		}
	}

	if (aKeys.length<=0)
		return;

	var $dialog 	= $("#AS_deleteAssignmentDialog")

	$("#AS_deleteAssignmentSec").html(infoStr)

	$dialog.dialog( {
		height: 'auto',
		buttons: {
			"||..........CANCEL..........||":function(){
				$dialog.dialog("close")
			},
			"Confirm":function(){
				$.post(
					"/php/deleteAssignment.php", {
						'aKeys[]':aKeys
					},
					function(data) {ass_deleteSelectedAssignment_CB(data)},
					'json'
				)

				////inProgress()
			}
		}
	})
	$dialog.dialog("open")
}

function ass_deleteSelectedAssignment_CB(data) {
	$("#AS_deleteAssignmentDialog").dialog("close")

	ass_getAssignment()

	////endProgress()
	appendStatus(data)
}

function assgetRemarks(assignmentKey){
	var rawKeys = assignmentKey.split("_");
	var assKey = rawKeys[1];

		if(assKey!=''){
			var dataInput = { assKey : assKey, cShotCompAKey: assignmentKey};
				$.ajax({
				      type: 'POST',
				      url: "/php/getRemark.php",
				      data: dataInput,
				      dataType: 'json',
				      success: function(result) {
				      	ass_setRemark_CB(result.remark, result.curShotCompAssKey);
				      }, error: function(e) {
				            alert('Error' + e);
				        }
				});

		}
}

function ass_setRemark_CB(data, assignmentKey) {
	$("#C6_" + assignmentKey).data("rem", data)
	ass_formatRemarks(assignmentKey)
}

function ass_copyPreviousRemarsk() {
	var	sColu		= new Array()
	$(".spk-check").each(function(index) {
		//if ($(this).attr("checked")) {
		if ($(this).prop("checked")) {
			var	curCompAKey	= $(this).val()

            assgetRemarks(curCompAKey)
			//$("#C6_" + curCompAKey).data("rem", $("#CT6_" + curCompAKey).data("rem"))
			//ass_formatRemarks(curCompAKey)
		}
	})
}

function ass_createShots() {
	var	uKey	= getSPKCookie("SPK_CurUserKey")
	var	pKey	= getSPKCookie("SPK_CurProject")
	var	maxLvl	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	var	sComp	= getSPKCookie("SPK_AA_CurShotComp")
	var	shotLevel	= new Array()
	for (i=1; i<=maxLvl; i++)
		shotLevel[i-1]	= getSPKCookie("SPK_AA_ShotLevelNum" + i)
}

function ass_createNewShotDialog(curShotLevel) {
	var $dialog = $("#AA_newDialog")

	var	maxLevel	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	var	curLev	= $("#AA_ShotLevelLabel" + curShotLevel).html()
	$("#AA_newLabel").text(curLev)

	var	hgt	= 140
	if (curShotLevel > 1) {
		$("#AA_syntax").show()
		hgt	= 160
	}
	else
		$("#AA_syntax").hide()

	$dialog.dialog( {
		title: ("Create New " + curLev),
		height: hgt,
		width: 450,
		buttons: {
			"OK":function(){
				ass_createNewShots(curShotLevel)
			}
		}
	})
	$dialog.dialog("open")
}

function ass_createNewShotLastLevel() {
	var	maxLevel	= getSPKCookie("SPK_AA_CurMaxShotLevel")
	var	sComp		= getSPKCookie("SPK_AA_CurShotComp")

	if (sComp.length > 1) {
		alert("Please select only one Shot Type")
		$("#AA_shotComponentSec").effect('pulsate',500)
	}
	else {
		for (i=0; i<maxLevel; i++) {
			var	tmp	= getSPKCookie("SPK_AA_ShotLevelNum" + i)
			if (tmp.indexOf('ALL')>-1) {
				if (i==1) {
					var	curLev	= $("#AA_ShotLevelLabel" + i).html()
					alert ('You are not allowed to create assignments for ALL ' + curLev + ". Please make a selection from " + curLev + " list.")
					return
				}
				ass_createNewShotDialog(i)
				return
			}
		}
		ass_createNewShotDialog(maxLevel)
	}
}

function ass_createNewShots(curShotLevel) {
	var	newShotNum	= $("#AA_newShot").val()
	newShotNum	= newShotNum.replace(/, /g, ',')
	newShotNum	= newShotNum.replace(/ /g, ',')

	if (newShotNum == "")
		alert("Please enter a number")
	else {
		var	usrkey	= getSPKCookie("SPK_CurUserKey")
		var	projkey	= getSPKCookie("SPK_CurProject")
		var	maxShot	= getSPKCookie("SPK_AA_CurMaxShotLevel")
		var	sComp	= getSPKCookie("SPK_AA_CurShotComp")
		var	shotLevel	= new Array()

		for (i=1; i<=curShotLevel; i++)
			shotLevel[i-1]	= getSPKCookie("SPK_AA_ShotLevelNum" + i)

		shotLevel[(curShotLevel-1)]	= newShotNum

		$.getJSON(
			"/php/createNewShot.php", {
				userKey:usrkey,
				projectKey:projkey,
				shotComp:sComp[0],
				curLevel:curShotLevel,
				maxLevel:maxShot,
				'shotLevels[]':shotLevel
			},
			function(data) {ass_createNewShots_CB(data)}
		)
		////inProgress()
	}
}

function ass_createNewShots_CB(data) {
	//alert(data.SQL)
	$("#AA_newDialog").dialog("close")
	$("#AA_newShot").empty()

	ass_resetScroll()
	ass_getAssignment()

	appendStatus(data)
	////endProgress()
}

function ass_updateStatus(curCell) {
	var	curMkey		= $("#"+curCell).data("MainKey")
	var	curCkey		= $("#"+curCell).data("ComponentKey")
	var	curCType	= $("#"+curCell).data("ComponentType")
	var	curAKey		= $("#"+curCell).data("AssignmentKey")
	var	assignTo	= $("#"+curCell).data("AssignTo")
	var	curDate		= $("#"+curCell).data("DueDate") + ' ' + GetCookie("SPK_TIMEZONESTR")
	var	uGrpKey		= getSPKCookie('SPK_CurUserGroupKey')
	var	uKey		= getSPKCookie("SPK_CurUserKey")

	$("#AA_US_dueDateFld").val(curDate)
	if (uGrpKey>2)
		$("#AA_dueDateSec").show()
	else {
		if (assignTo != uKey) {
			var	stat	= new Object()
			stat.ErrorStatus	= new Array()
			stat.ErrorStatus[0]	= 'You are not allowed to update this status'
			appendStatus(stat)
			return
		}

		$("#AA_dueDateSec").hide()
	}

	$("#AA_UpdateStatusRemark").val("")
	var	titleStr	= "Update Status : " + $("#C_"+curMkey).text() + " - " + $("#"+curCell).data("AssignmentName")

	var $dialog 	= $("#AS_UpdateStatusDialog")
	$dialog.dialog({
		title: titleStr,
		width: "500px",
		buttons: {
			"Save":function(){
				var	assType	= getSPKCookie("SPK_AA_CurAssignType")
				var	curStat	= $("#AA_UpdateStatusFilList").val()
				var	curRem	= $("#AA_UpdateStatusRemark").val()
				var	curDate	= $("#AA_US_dueDateFld").val()
				var	uKey	= getSPKCookie("SPK_CurUserKey")

				if (curDate==null || curDate=='') {
					alert("Please provide a valid due date!")
					$("#AA_US_dueDateFld").effect('pulsate',500)
					return
				}

				var today	= new Date()
				var dueDate	= strToDate(curDate)
				if (curStat<4 || curStat==8 || curStat==10 || curStat==13 || curStat==16) {
					if (dueDate<today) {
						alert("Please provide a valid due date!")
						$("#AA_US_dueDateFld").effect('pulsate',500)

						return
					}
				}

				cur_AA_AJAX	= $.getJSON(
					"/php/saveIndividualAssignment.php", {
						assignment:assType,
						curUser: uKey,
						aKey: curAKey,
						aStat: curStat,
						dueDate: curDate,
						aRem: curRem
					},
					function(data) {
						appendStatus(data)

						if (data.Status) {
							var $dialog 	= $("#AS_UpdateStatusDialog")
							$dialog.dialog("close")
							ass_getContent()
						}
						////endProgress()
					}
				)

				////inProgress()
			}
		}
	})

	$dialog.dialog("open")

	$("#AA_UpdateStatusFilList").blur(function() {
		var	assType	= getSPKCookie("SPK_AA_CurAssignType")
		// This is using StatusKey
		if (assType	== 'Asset' && $("#AA_UpdateStatusFilList").val() == 5) {
			// Status set to DIR Approve
			if (curCType == 'Facial' || curCType == 'Rig') {
				return;
			}
			else if (UPLOAD_DIALOG_OPEN == 0) {
				$dialog.dialog("close")
				ass_submitAssetImage(0, curCkey, curAKey)
			}
		}
	})
}

function ass_formatRemarks(j) {
	var	rem	= $("#C6_"+j).data("rem")
    var	remHTML = assignManager.utils.formatRemarks(rem)
	$("#C6_"+j).html(remHTML)
}

function ass_filterTask(opt) {
	if (opt == 0) {
		// My pending tasks
		// So curStat here is actually StatusKey instead of SortOrder
		var	curStat	= "4,5,11,9,17,18"
		setSPKCookie("SPK_AA_CurStatus", curStat)
	}
	else if (opt == 1) {
		// All pending tasks
		// So curStat here is actually StatusKey instead of SortOrder
		var	curStat	= "4,5,11,9"
		setSPKCookie("SPK_AA_CurStatus", curStat)
	}
	else if (opt == 2) {
		// All submission
		// So curStat here is actually StatusKey instead of SortOrder
		var	curStat	= "6,14"
		setSPKCookie("SPK_AA_CurStatus", curStat)
	}
	else if (opt == 3) {
		// All SPK Approved
		var	curStat	= "4"
		setSPKCookie("SPK_AA_CurStatus", curStat)
	}
	else if (opt == 4) {
		// All Except Obsolete
		var	curStat	= "1,2,3,13,6,14,7,8,12,23,4,15,5,11,17,18,10,16,19,20,21,24"
		setSPKCookie("SPK_AA_CurStatus", curStat)
	}
	applySPKCookie('SPK_AA_CurStatus', 'AA_statusFilList', 'ALL')

	if (opt == 0 || opt == 1)
		setSPKCookie("SPK_AA_CurStatusListInv", 'TRUE')
	else if (opt == 2 || opt == 3 || opt == 4)
		setSPKCookie("SPK_AA_CurStatusListInv", 'FALSE')
	applySPKCookie('SPK_AA_CurStatusListInv', 'AA_StatusListInvChkBox', '')

	if (opt < 4) {
		setSPKCookie(("SPK_AA_ShotLevelNum1"), 'ALL')
		applySPKCookie('SPK_AA_ShotLevelNum1', 'AA_ShotLevelList1', '')

		setSPKCookie(("SPK_AA_CurAssetCat"), 'ALL')
		applySPKCookie('SPK_AA_CurAssetCat', 'AA_assetCategoryList', 'ALL')

		setSPKCookie(("SPK_AA_CurAssetGroup"), 'ALL')
		applySPKCookie('SPK_AA_CurAssetGroup', 'AA_assetGroupList', 'ALL')
	}

	if (opt == 0) {
		var	curUser	= getSPKCookie('SPK_CurUserKey')
		setSPKCookie("SPK_AA_CurUserKey", curUser)
	}
	else if (opt == 1 || opt == 2)
		setSPKCookie("SPK_AA_CurUserKey", 'ALL')
	applySPKCookie('SPK_AA_CurUserKey', 'AA_userList', 'ALL')

	$("#AA_fromDateFld").val('')
	$("#AA_toDateFld").val('')
	setSPKCookie("SPK_AA_SearchStr", '')
	$("#AA_searchFld").val('')

	var	curAssType	= $("#AA_assignTypeList").val()
	if (curAssType=="Asset")
		ass_getAssetGroupList()
	else if (curAssType=="Shot")
		ass_getShotLevelList(1)

	//ass_resetScroll()
	//ass_getContent()
}

function ass_copySelectedToSearch() {
	var	sCompKey	= new Array()
	var	srcToken	= new Array()
	var	srcStr		= "";
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked"))
			srcToken[srcToken.length]	= $(this).data("SKey")
	})

	srcToken	= removeArrayDuplicate(srcToken)
	srcToken	= srcToken.sort(function(a,b){
		var	aR	= a.split(':')
		var	bR	= b.split(':')

		for (i=0; i<aR.length; i++) {
			if (parseInt(aR[i])>parseInt(bR[i]))
				return 1;
			if (parseInt(aR[i])<parseInt(bR[i]))
				return -1;
			if (aR[i]>bR[i])
				return 1;
			if (aR[i]<bR[i])
				return -1;
		}
	})

	var	curSplit	= new Array()
	var	preSplit	= srcToken[0].split(":")
	srcStr			= srcToken[0].replace(/\:/g, "[")

	var	len	= preSplit.length
	for (i=1; i<srcToken.length; i++) {
		var	curSplit	= srcToken[i].split(":")
		for (j=0; j<len; j++) {
			if (preSplit[j] != curSplit[j]) {
				if (j<len-1) {
					srcStr	+= "] " + curSplit[j] + "[" + curSplit[j+1]
					for (k=j+2; k<len; k++)
						srcStr	+= " " + curSplit[k]
					break;
				}
				else
					srcStr	+= " " + curSplit[j]
			}
		}
		preSplit	= curSplit
	}

	for (i=1; i<len; i++)
		srcStr	+= "]"

	//$("#AA_searchSec").accordion({active: 0})
	$("#AA_searchFld").val(srcStr)

	setSPKCookie("SPK_AA_SearchStr", $("#AA_searchFld").val())
	//setSPKCookie("SPK_AA_SearchStr", srcStr)
	ass_resetScroll();
	ass_getContent();
}

function ass_viewSelectedVideo() {
	var	sCompKey	= new Array()

	$(".spk-check").each(function(index) {
		//if ($(this).attr("checked")) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
		}
	})

	if (sCompKey.length>0)
		ass_getVideo(sCompKey)
}

function ass_getProjectStudioList() {
//	var	assType	= getSPKCookie("SPK_AA_CurAssignType")
	var	assType	= "Shot"

	var	projkey	= getSPKCookie("SPK_CurProject")

	$.getJSON(
		"getProjectStudioList", {
			proj:projkey,
			assignment:assType,
		},
		function(data) {
			appendStatus(data)
			console.log(data.data.StudioKey)
			$("#AA_syncRenderBtn").hide()
			$("#AA_syncCompBtn").hide()

			if (data.data.StudioKey.length>0) {
				var	curStd	= getSPKCookie("SPK_AA_CurStudio")

				if (assType=='Shot' && data.data.StudioKey.length>1) {
					$("#AA_syncRenderBtn").show()
					$("#AA_syncCompBtn").show()
				}

				$("#AA_studioCount").text(data.data.StudioKey.length)

				var	syncStdKey	= [];
				var	syncLoc		= [];
				var curStd		= getSPKCookie('SPK_STUDIOKEY')

				for (i=0;i<data.data.StudioKey.length;i++) {
					if (data.data.StudioKey[i]==curStd)
						continue
					syncStdKey[syncStdKey.length]	= data.data.StudioKey[i]
					syncLoc[syncLoc.length]			= data.data.Location[i]
				}

				data.data.StudioKey.unshift('ALL')
				data.data.Location.unshift('ALL')

				syncStdKey.unshift('ALL')
				syncLoc.unshift('ALL')

				CreateOptionPair("AA_studioList", data.data.StudioKey, data.data.Location, '')
				applySPKCookie("SPK_AA_CurStudio", 'AA_studioList', curStd)

				CreateOptionPair("AS_studioRLList", syncStdKey, syncLoc, 'ALL')
				//Rajesh Fithelis: SyncPlayblast
				CreateOptionPair("AS_studioPbList", syncStdKey, syncLoc, 'ALL')
				CreateOptionPair("AS_studioPbFilesList", syncStdKey, syncLoc, 'ALL')
				CreateOptionPair("AS_studioCIList", syncStdKey, syncLoc, 'ALL')
			}
			else {
				ClearOptions("AA_studioList")
				ClearOptions("AS_studioRLList")
				//Rajesh Fithelis: SyncPlayblast
				ClearOptions("AS_studioPbList")
				ClearOptions("AS_studioPbFilesList")
				ClearOptions("AS_studioCIList")
			}
		}
	)
}

function ass_syncSelectedRenderLayers() {
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
		}
	})

	if (sCompKey.length>0) {
		var	projkey		= getSPKCookie("SPK_CurProject")

		if (projkey>91 || projkey==65 /*|| projkey==77*/ || projkey==88)
			$("#AS_LayersSec").show()
		else {
			$("#AS_layerList").val('ALL')
			$("#AS_LayersSec").hide()
		}

		var $dialog = $("#AS_SyncRenderLayerDialog")
		$dialog.dialog( {
			buttons: {
				"OK":function(){
					var	studio	= $("#AS_studioRLList").val();
					var	layer	= $("#AS_layerList").val();

					$.post(
						"/php/syncRenderLayers.php", {
							'compKey[]':sCompKey,
							'studio':studio,
							'layer':layer
						},
						function(data) {
							appendStatus(data)
							$dialog.dialog("close")
							////endProgress()
						},
						'json'
					)
					////inProgress()
				}
			}
		})
		$dialog.dialog("open")
	}
}

//Rajesh Fithelis: SyncPlayblast under the scene folder
function ass_syncSelectedPlayblast() {
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
		}
	})

	if (sCompKey.length>0) {
		var	projkey		= getSPKCookie("SPK_CurProject")

		if (projkey>91 || projkey==65 /*|| projkey==77*/ || projkey==88)
			$("#AS_PlayblastSec").show()
		else {
			$("#AS_playblastList").val('ALL')
			$("#AS_PlayblastSec").hide()
		}

		var $dialog = $("#AS_SyncPlayblastDialog")
		$dialog.dialog( {
			buttons: {
				"OK":function(){
					var	studio	= $("#AS_studioPbList").val();
					var	layer	= $("#AS_playblastList").val();
					console.log('Studio: '+studio)
					console.log('Layer: '+layer)
					console.log('sCompKey: '+sCompKey)
					$.post(
						"/php/syncRenderPlayblast.php", {
							'compKey[]':sCompKey,
							'studio':studio,
							'layer':layer
						},
						function(data) {
							appendStatus(data)
							$dialog.dialog("close")
							//endProgress()
						},
						'json'
					)
					//inProgress()
				}
			}
		})
		$dialog.dialog("open")
	}
}

//Rajesh Fithelis: SyncPlayblast files under the latest folder
function ass_syncSelectedLatestPlayblastFiles() {
	console.log("assignment2.3.js")
	console.log("ass_syncSelectedLatestPlayblastFiles")
	var	sCompKey	= new Array()
	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
		}
	})

	if (sCompKey.length>0) {
		var	projkey		= getSPKCookie("SPK_CurProject")

		if (projkey>91 || projkey==65 /*|| projkey==77*/ || projkey==88)
			$("#AS_LatestPlayblastFilesSec").show()
		else {
			$("#AS_playblastFilesList").val('ALL')
			$("#AS_LatestPlayblastFilesSec").hide()
		}

		var $dialog = $("#AS_SyncLatestPlayblastFilesDialog")
		$dialog.dialog( {
			buttons: {
				"OK":function(){
					var	studio	= $("#AS_studioPbFilesList").val();
					var	layer	= $("#AS_playblastFilesList").val();
					console.log('Studio: '+studio)
					console.log('Layer: '+layer)
					console.log('sCompKey: '+sCompKey)
					$.post(
						"/php/syncRenderLatestPlayblastFiles.php", {
							'compKey[]':sCompKey,
							'studio':studio,
							'layer':layer
						},
						function(data) {
							appendStatus(data)
							$dialog.dialog("close")
							//endProgress()
						},
						'json'
					)
					//inProgress()
					appendStatus(data)
				}
			}
		})
		$dialog.dialog("open")
	}
}

function ass_syncSelectedCompImages() {
	var	sCompKey	= new Array()
	var	assKey		= new Array()

	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
			assKey[assKey.length]		= temp[1]
		}
	})

	if (sCompKey.length>0) {
		var $dialog = $("#AS_SyncCompImagesDialog")
		$dialog.dialog( {
			buttons: {
				"OK":function(){
					var	studio	= $("#AS_studioCIList").val();

					$.post(
						"/php/syncCompImages.php", {
							'compKey[]':sCompKey,
							'assKey[]':assKey,
							'studio':studio,
						},
						function(data) {
							appendStatus(data)
							$dialog.dialog("close")
							////endProgress()
						},
						'json'
					)
					////inProgress()
				}
			}
		})
		$dialog.dialog("open")
	}
}

function ass_submitShotFileToBBF() {(",")
	var	pKey		= getSPKCookie("SPK_CurProject")
	var	sCompKey	= new Array()
	var	assKey		= new Array()

	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
			assKey[assKey.length]		= temp[1]
		}
	})

	if (sCompKey.length>0) {
		$.getJSON(
			"/php/submitShotFileToBBF.php", {
				'pKey':pKey,
				'compKey[]':sCompKey,
				'assKey[]':assKey
			},
			function(data) {
				appendStatus(data)
				////endProgress()
			}
		)
		////inProgress()
	}
}

function ass_submitShotFileToClient() {(",")
	var	pKey		= getSPKCookie("SPK_CurProject")
	var	sCompKey	= new Array()
	var	assKey		= new Array()

	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
			assKey[assKey.length]		= temp[1]
		}
	})

	if (sCompKey.length>0) {
		$.getJSON(
			"/php/submitShotFileToClient.php", {
				'pKey':pKey,
				'compKey[]':sCompKey,
				'assKey[]':assKey
			},
			function(data) {
				appendStatus(data)
				////endProgress()
			}
		)
		////inProgress()
	}
}

function ass_convertToAvidMOV() {(",")
	var	pKey		= getSPKCookie("SPK_CurProject")
	var	sCompKey	= new Array()
	var	assKey		= new Array()

	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
			assKey[assKey.length]		= temp[1]
		}
	})

	if (sCompKey.length>0) {
		$.getJSON(
			"/php/convertToAvidMOV.php", {
				'pKey':pKey,
				'compKey[]':sCompKey,
				'assKey[]':assKey
			},
			function(data) {
				appendStatus(data)
				////endProgress()
			}
		)
		////inProgress()
	}
}

function ass_convertToNukeMOV_DNxHD() {(",")
	var	pKey		= getSPKCookie("SPK_CurProject")
	var	sCompKey	= new Array()
	var	assKey		= new Array()

	$(".spk-check").each(function(index) {
		if ($(this).prop("checked")) {
			var	temp	= $(this).val().split("_")
			sCompKey[sCompKey.length]	= temp[0]
			assKey[assKey.length]		= temp[1]
		}
	})

	if (sCompKey.length>0) {
		$.getJSON(
			"/php/convertToNukeMOV.php", {
				'pKey':pKey,
				'compKey[]':sCompKey,
				'assKey[]':assKey
			},
			function(data) {
				appendStatus(data)
				////endProgress()
			}
		)
		////inProgress()
	}
}

function ass_play(type) {
	var	key	= $("#AS_HistorySec").data("key")
	// console.log("shotKey: " + key)
	var url	= "shotViewer.php"
	url	+= "?prefix=SP1"
	url	+= "&sKey=" + key
	url	+= "&dComp=" + type

	var	para		= "status=0,menubar=0,titlebar=0,toolbar=0,resizable=1"
	window.open(url, "", para)
}

function ass_getVideo(compKey) {
	if($.isArray(compKey)) {
		$.getJSON(
			"/php/getLatestShotVersion.php", {
				'compKey[]':compKey
			},
			function(data) {ass_getVideo_CB(data)}
		)
		////inProgress()
	}
	else {
		var	cShtComp		= getSPKCookie("SPK_AA_CurShotComp")
		if (cShtComp[0] == 'Lighting') {
			console.log("lighting test from assignment2.3.js");
		}
		//console.log("cShtComp")
		//console.log(cShtComp[0])
		/*if (cShtComp[0] == 'Lightingx') {
			//var fpath ="http://spknet.spkic.spkanim.com/proj/ZOO//ZOO_Data/_Video/Season1/Animation/ZOO114/Sc086/ZOO114_Sc086_Animation_V01.mov"
			var fpath ="http://spknet.spkic.spkanim.com/proj/render//ZOO_RenderImages/Mov/ZOO114/QC_Preview/ZOO114_Sc085_Animation_V01.mov"
			var ext = "mov"
			remVideo(fpath, ext);
		}*/
		var url	= "shotViewer.php"
		url	+= "?prefix=SP1"
		url	+= "&cKey=" + compKey

		var	para		= "status=0,menubar=0,titlebar=0,toolbar=0,resizable=1"
		window.open(url, "", para)
	}
}

function ass_getVideo_CB(data) {
	if (data.versionKey != null) {
		var	vStr	= data.versionKey[0]
		for (i=1;i<data.versionKey.length;i++)
			vStr	+= ","+data.versionKey[i]

		var url	= "video.php"
		url	+= "?vKey=" + vStr
		url	+= "&sid=" + Math.random()

		var	para		= "status=0, menubar=0, titlebar=0, toolbar=0, resizable=1"
		window.open(url, "", para)
	}

	appendStatus(data)
	////endProgress()
}

function ass_autoRefreshChange() {
	if ($("#AA_AutoRefreshChkBox").prop("checked")) {
		setSPKCookie("SPK_AA_AutoRefresh", 'TRUE')

		//alert("Enable Auto Refresh")

		if (REFRESH_STATE!=null || REFRESH_STATE!="")
			clearTimeout(REFRESH_STATE)

		NOREFRESH	= 0
		REFRESH_STATE = setTimeout("ass_autoGetContent()", REFRESH_FREQ);
	}
	else {
		setSPKCookie("SPK_AA_AutoRefresh", 'FALSE')
		//alert("Disable Auto Refresh")

		if (REFRESH_STATE!=null || REFRESH_STATE!="")
			clearTimeout(REFRESH_STATE)

		NOREFRESH	= 1
	}
}

function ass_autoEnableRefresh() {
	var	today	= new Date()
	var	stat	= new Object()
	stat.Status	= new Array()

	$("#AA_AutoRefreshChkBox").prop("checked", 1)

	if (REFRESH_STATE!=null || REFRESH_STATE!="")
		clearTimeout(REFRESH_STATE)

	NOREFRESH	= 0
	REFRESH_STATE = setTimeout("ass_autoGetContent()", REFRESH_FREQ);

	stat.Status[0]	= today.toLocaleTimeString() + " - Auto Refresh is enabled as there is no further action after previous editing."
	appendStatus(stat)
}

function ass_autoGetContent(){
	var	today	= new Date()
	var	stat	= new Object()
	stat.Status	= new Array()

	if (NOREFRESH) {
		//alert("No Refresh! Disable auto refresh now")
		$("#AA_AutoRefreshChkBox").prop("checked", 0)

		if (REFRESH_STATE!=null || REFRESH_STATE!="")
			clearTimeout(REFRESH_STATE)

		stat.Status[0]	= today.toLocaleTimeString() + " - Auto Refresh is disabled as editing is detected."
		appendStatus(stat)

		REFRESH_STATE = setTimeout("ass_autoEnableRefresh()", REFRESH_FREQ*3);
	}
	else {
		if (REFRESH_STATE!=null || REFRESH_STATE!="")
			clearTimeout(REFRESH_STATE)

		REFRESH_STATE = setTimeout("ass_autoGetContent()", REFRESH_FREQ);

		stat.Status[0]	= today.toLocaleTimeString() + " - Auto Refreshing"
		appendStatus(stat)
		ass_getContent()
	}
}

function ass_resetScroll() {
	$("#AA_TBody").attr("scrollTop", 0)
}

function ass_openImageSimple(file) {
	var	para		= "status=0, menubar=0, titlebar=0, toolbar=0, location=0, resizable=1, left=0, top=0"
	window.open(file, "", para)
}

function ass_openImage(file) {
	//file	= file.replace('//spkrender01/', '/proj/render/')
	if (file=='') {
		setStatusMessage('Invalid image path : ', 2)
		return
	}

	var	para		= "status=0, menubar=0, titlebar=0, toolbar=0, location=0, resizable=1, left=0, top=0, innerWidth=1920, innerHeight =1080"
	window.open('imageViewer.php?file=' + file, '', para)
}

function ass_openCompImageViewer(compKey, ver, index) {
	var	para	= "status=0,menubar=0,titlebar=0,toolbar=0,location=0,resizable=1,left=0,top=0"
	var	str		= 'componentImageViewer.php?compKey=' + compKey + "&index=" + index
	if (ver!='')
		str	+= '&ver='+ver
	window.open(str, '', para)
}