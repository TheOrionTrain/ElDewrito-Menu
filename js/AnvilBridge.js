/**
 * AnvilBridge by kiwidog
 *
 * This is what Awesomium will use to communicate and be able to manipulate the html/css from C++
 *
 * Mantis automatically exposes the bridge on the C++ side as well, under the name "app".
 * The variable name "app" (without quotes) shall be treated as reserved.
 *
 * Currently, C++ supports one method at this time until it is expanded by the requests of the menu designers
 *
 * app.onMethodCall(<parameters>);
 *
 * An example usage is:
 * (From Menu.html)
 *
 * <li onclick="app.onMethodCall('quit');">QUIT</li>
 *
 * This will send a "quit" message to C++ to then parse and figure out what to do with it.
 *
 * All requests should be made in this manner and be parsed to and sent in json format for sanity reasons.
 *
 * From C++ you can call web_renderer::setElementContent(std::string p_ElementName, std::string p_InnerHtml);
 *
 * You should be able to call this from anywhere using
 * web_renderer::getInstance()->setElementContent("players-online", "2 Players Online");
 */

function SetElementContent(p_ElementName, p_Content)
{
    var s_Element = document.getElementById(p_ElementName);
    if (!s_Element)
        return false;

    s_Element.innerHTML = p_Content;
    return true;
}

function SetElementDisplay(p_ElementName, p_Display)
{
    var s_Element = document.getElementById(p_ElementName);
    if (!s_Element)
        return false;

    s_Element.style.display = p_Display;
    return true;
}

function LoadMenu(p_MenuLocation)
{
    if (!p_MenuLocation)
        return false;
	
	$("#container-page").load(p_MenuLocation);
	
	return true;
}

function ShowNotification(p_Title, p_Message)
{
    if (!p_Title || !p_Message)
        return false;

    console.log("showing notification");

    var s_Note = document.getElementById("note");
    var s_NoteTitle = document.getElementById("note-title");
    var s_NoteBody = document.getElementById("note-body");

    // Depending on the user's config they may not want a user bar at all and remove it in the html
    if (!s_Note || !s_NoteTitle || !s_NoteBody)
        return false;

    s_NoteTitle.innerHTML = p_Title;
    s_NoteBody.innerHTML = p_Message;

    console.log("found notification overlay");

    s_Note.style.display = "block";
    s_Note.style.animation = "note-in 1200ms 1";

    setTimeout(function()
    {
        s_Note.style.animation = "";
        s_Note.style.animation = "note-out 1200ms 1";

        setTimeout(function()
        {
            s_Note.style.display = "none";
        }, 1000);
    }, 4000);

    return true;
}
