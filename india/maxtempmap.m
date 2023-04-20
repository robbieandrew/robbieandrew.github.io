% Animation of India's gridded maximum daily temperature
clear
bWriteFiles = true ;
% If bOverwrite is false, only show/write newer dates. If there's nothing new, nothing
% will be shown or written to file.
bOverwrite = false ; 
% Hopes and dreams, but F doesn't work yet
bCelsius = true ;
% Keep track of how many new files were written
iNewPNGs = 0 ;

fpath = [userSpecRoot() 'RawDataStore\Energy\India\Climate\DailyMaxTemp\'] ;
fpref = 'india_halfdeg_' ;
ef_params = {'-r100','-nocrop','-painters'} ;
% Colour map
if 0 % These are the original colours from Indian met office
    degbins = [-Inf -6 -4 -2 0 4 8 12:2:40 Inf] ;
    cm_scale = hexColour2RGB({'692b67','a22a9a','9e62cb','c199dd','4801fe','715cfd','4494ff','00b00c','00de12','55ff68','c9ffcd','fdffcc','faff37','fdcd67','ffcdcc','fe9a99','ff3a31','ec1700','cc1300','993600','630501','787878'})/255 ;
else % I add some more detail at the high end
    if bCelsius
        degbins = [-Inf -6 -4 -2 0 4 8 12:2:48 Inf] ;
    else
        degbins = [-Inf 20 24 28 32 39 46 53:4:120 Inf] ;
    end
    cm_scale = hexColour2RGB({'692b67','a22a9a','9e62cb','c199dd','4801fe','715cfd','4494ff','00b00c','00de12','55ff68','c9ffcd','fdffcc','faff37','fdcd67','ffcdcc','fe9a99','ff3a31','ec1700','cc1300','993600','630501','000000','404040','606060','909090','D0D0D0'})/255 ;
end
iOffset = iff(bCelsius,128,0) ;
% For each value between 1 and 255, figure out what the colour should be given that 128
% should map to zero degrees, which is between the 4th and 5th colours in this sequence.
    degbinsadj = iOffset+degbins ;
    for i=1:255
        cm(i,:) = cm_scale(find(i>=degbinsadj,1,'last'),:) ;
    end
% Add white for the background
    % This means I have to add 1 a lot to colour indices...
    cm = [1 1 1; cm] ;
% Load the land area mask that Indian met office use
    mask = flipud(dlmread([fpath '61mapgrid.prn'])) ;
% Find all grid files and sort by date
    d = dir([fpath 'halfdeg\*.grd']) ;
    yyyymmdd = tocol(cellfun(@(x) str2double(x([8:11 6:7 4:5])),{d.name})) ;
    [~,i] = sort(yyyymmdd,'ascend') ;
    d = d(i) ;
    yyyymmdd = yyyymmdd(i) ;
% Days per year for each date
    yr = floor(yyyymmdd/10000) ;
    dpy = sum(dayspermonth(yr),2) ;
    dn = datenum([floor(yyyymmdd/10000) mod(floor(yyyymmdd/100),100) mod(yyyymmdd,100) repmat([0 0 0],numel(yyyymmdd),1)]) ;
    jd = dn-datenum([yr repmat([1 1 0 0 0],numel(yyyymmdd),1)])+1 ;
    jdfrac = jd./dpy ;
% Initialise figure
    clf
    figure(gcf)
    set(gcf,'Color',[1 1 1])
    centreFig([700 420])
    colormap(cm)

for i=1:numel(d)
    if d(i).bytes==0, continue ; end % Skip empty files (possible at end of series)
    % Don't bother if overwrite mode is on and the chart is already saved
        fnamej = [fpath 'anim\' fpref num2str(i,'%04.0f') '.png'] ;
        if bWriteFiles && ~bOverwrite && exist(fnamej,'file')
            continue
        end
    % Read file
        fid = fopen([d(i).folder '\' d(i).name],'r') ;
        temp = fread(fid,Inf,'float32') ;
        fclose(fid) ;
    % Process
        temp = reshape(temp,[61 61]) ;
        temp = flipud(temp') ;
        if ~bCelsius
            temp = temp*9/5+32 ;
        end
    s = (temp+iOffset+1).*mask ;
    s(s>iff(bCelsius,220,150)) = 0 ;
    temp(temp>iff(bCelsius,60,140)) = 0 ;
    sDate = datestr(dn(i),'dd mmmm') ;
    avg = mean(mean(temp(mask>0))) ;
    sAvgTemp = sprintf('%.1f°%s',avg,iff(bCelsius,'C','F')) ;
    if sDate(1)=='0', sDate = sDate(2:end) ; end
    sYear = datestr(dn(i),'yyyy') ;
    % After the first figure is drawn, subsequent loops don't redraw from scratch but
    % rather just update the properties of the drawn objects
    if exist('hImage','var')
        hImage.CData = s ;
        x = ax(1)+jdfrac(i)*(ax(2)-ax(1)) ;
        hJD.XData = [x x] ;
        hDate.String = sDate ;
        hDate.Position(1) = x ;
        hYear.String = sYear ;
        yavg = interp1(degbins_finite,yz(2:end),avg) ;
        hAvgPatch.YData = yavg+[0 dy -dy] ;
        hAvgPatch.FaceColor = cm(floor(avg)+iOffset+1,:) ;
        hAvgText.String = sAvgTemp ;
        hAvgText.Position(2) = yavg+0.2*dy ;
        hAvgAvgText.Position(2) = yavg-4*dy ;
    else
        hImage = image(s) ;
        axis square
        axis off
        hold on
        ax = axis ;
        % Shift axes a little. Note that with axis square, it sits in the middle of the
        % axes
            set(gca,'Position',[0.25 0.15 0.55 0.8150])
        drawnow
        % Date scale
            x = ax(1)+jdfrac(i)*(ax(2)-ax(1)) ;
            [dx,dy] = fig2dswh(0.01,0.01) ;
            plot(ax([1 2]),ax([4 4])+3*dy,'k','Clipping','off')
            y = ax(4)-[-4 -2]*dy ;
            hJD = plot([x x],y,'k','LineWidth',1.5,'Clipping','off') ;
            hDate = text(x,y(1),sDate,'Clipping','off','VerticalAlignment','top','HorizontalAlignment','center') ;
        gcpDataText2(TWT_Robbie,'Data: India Meteorological Department')
        % Labelling
            [x,y] = fig2dsxy(0.53,0.25) ;
            hTitle = text(x,y,'India daily max temperature','FontSize',16) ;
            showText('Grid: 0.5°\times0.5°','under',hTitle) ;
            hYear = text(ax(2)+dx,ax(4)+3*dy,sYear,'VerticalAlignment','middle','FontSize',15) ;
        % Color scale
            [x,y] = fig2dsxy([0.07 0.10],[0.15 0.95]) ;
            n = numel(degbins) ;
            for j=1:n-1
                p = {'Clipping','off','FaceColor',cm_scale(j,:)} ;
                yy = y(1)+(j+[0 0 1 1])*diff(y)/n ;
                if j==1
                    patch([x([1 2]) mean(x)],yy([3 3 1]),1,p{:})
                elseif j==n-1
                    patch([x([1 2]) mean(x)],yy([1 1 3]),1,p{:})
                else
                    patch(x([1 2 2 1]),yy,1,p{:})
                end
                % Degree labels, alternating left and right sides of the scale
                if j<n-1
                    if mod(j,2)==1
                        text(x(2)+dx,yy(3)+dy/2,sprintf('%d',degbins(j+1)))
                    else
                        text(x(1)-dx,yy(3)+dy/2,sprintf('%d',degbins(j+1)),'HorizontalAlignment','right')
                    end
                end
            end
        % Average marker
            yz = y(1):diff(y)/n:y(2) ;
            % interp1 requires finite values
                degbins_finite = degbins ;
                degbins_finite(1) = -40 ;
                degbins_finite(end) = 1000 ;
            yavg = interp1(degbins_finite,yz(2:end),avg) ;
            hAvgPatch = patch(x(2)+[4 6 6]*dx,yavg+[0 dy -dy],1,'Clipping','off','FaceColor',cm(ceil(avg)+iOffset+1,:)) ;
            hAvgText = text(x(2)+6.5*dx,yavg+0.2*dy,sAvgTemp,'VerticalAlignment','middle') ;
            hAvgAvgText = text(x(2)+5*dx,yavg-4*dy,'Average') ;
    end
    
    drawnow
    
    if bWriteFiles
        export_fig(ef_params{:},fnamej) ;
        iNewPNGs = iNewPNGs + 1 ;
    else
        pause(0.05)
    end
end

if bWriteFiles && iNewPNGs>0
    % Create MP4
    disp('Running FFMPEG to create MP4...')
    p = [fpath 'anim\'] ;
    ffmpeg_exe = getpathFFMPEG() ;
    e = dos([ffmpeg_exe ' -loglevel quiet -y -i ' p fpref '%04d.png -c:v libx264 -vf "fps=25,format=yuv420p,crop=in_w:in_h-1" ' p 'india_halfdeg_nopause.mp4']) ;
    sFinalPause = ' -filter_complex "[0]trim=0:8[hold];[0][hold]concat[extended];[extended][0]overlay" ' ;
    e = dos([ffmpeg_exe ' -loglevel quiet -y -i ' p 'india_halfdeg_nopause.mp4 ' sFinalPause  p 'india_halfdeg.mp4']) ;
end

