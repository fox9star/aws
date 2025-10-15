<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <title><?php bloginfo('name'); ?></title>
  <link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>">
</head>
<body>
  <h1><?php bloginfo('name'); ?></h1>
  <p><?php bloginfo('description'); ?></p>

  <?php
    if ( have_posts() ) :
      while ( have_posts() ) : the_post();
        echo '<h2>' . get_the_title() . '</h2>';
        the_content();
      endwhile;
    else :
      echo '<p>게시물이 없습니다.</p>';
    endif;
  ?>
</body>
</html>
