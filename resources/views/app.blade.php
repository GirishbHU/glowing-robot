<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/favicon.png">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-950 text-white">
        <!-- Sanity Check: If you see this green text, HTML is loading -->
        <div id="loading-check" style="position:fixed; top:0; left:0; z-index:9999; color:lime;">System Check: HTML Loaded</div>
        @inertia
        <script>
            console.log('🔍 Blade Template Loaded');
            document.getElementById('loading-check').style.display = 'none'; // Auto-hide if JS runs
        </script>
    </body>
</html>
